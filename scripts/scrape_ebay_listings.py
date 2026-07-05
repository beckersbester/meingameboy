#!/usr/bin/env python3
"""Scrape eBay listing variants via Playwright - outputs JSON to stdout."""
import asyncio
import json
import re
import sys

from playwright.async_api import async_playwright

IDS = [
    "298482294642",
    "298482300934",
    "298482317876",
    "298482323551",
    "298482326596",
    "298482343251",
]

COND_TO_Z = {
    "Akzeptabel": "z1",
    "Gut": "z2",
    "Sehr Gut": "z3",
    "Neuwertig": "z4",
}

Z_TO_COND = {v: k for k, v in COND_TO_Z.items()}


def parse_listing(html, item_id):
    title_m = re.search(
        r'"mainTitle"\s*:\s*\{"_type":"TextualDisplay"[^}]*"textSpans":\[\{"_type":"TextSpan","text":"([^"]+)"',
        html,
    )
    if not title_m:
        title_m = re.search(r"<h1[^>]*>(?:<span[^>]*>)?([^<]+)", html)
    title = title_m.group(1).strip() if title_m else ""

    chunk_start = html.find("menuItemMap")
    chunk = html[chunk_start : chunk_start + 5000] if chunk_start >= 0 else ""

    menu = {}
    for m in re.finditer(
        r'"(\d+)":\{"valueId":\d+,"valueName":"([^"]+)"[^}]+matchingVariationIds":\[(\d+)\][^}]*outOfStock":(true|false)',
        chunk,
    ):
        menu[m.group(2)] = {"var_id": m.group(3), "out_of_stock": m.group(4) == "true"}

    prices = {}
    for m in re.finditer(
        r'"(\d{12,})":\{"binModel":\{"price":\{"_type":"TextualDisplayValue","value":\{"value":([0-9.]+)',
        html,
    ):
        prices[m.group(1)] = float(m.group(2))

    qty = {}
    for m in re.finditer(
        r'"(\d{12,})":\{"binModel"[\s\S]{0,900}?"quantity":\{"_type":"QuantityViewModel"[\s\S]{0,500}?"maxQuantity":(\d+)',
        html,
    ):
        qty[m.group(1)] = int(m.group(2))

    images = {}
    for m in re.finditer(
        r'"(\d{12,})":\{[\s\S]{0,2500}?"displayPrice"[\s\S]{0,1200}?"image":\{"_type":"Image"[^}]*"URL":"([^"]+)"',
        html,
    ):
        vid = m.group(1)
        url = m.group(2).replace("\\u002F", "/")
        url = re.sub(r"/s-l\d+\.", "/s-l1600.", url)
        for name, z in COND_TO_Z.items():
            if name in menu and menu[name]["var_id"] == vid:
                images[z] = url

    variants = {}
    for name, z in COND_TO_Z.items():
        if name not in menu:
            continue
        vid = menu[name]["var_id"]
        stock = 0 if menu[name]["out_of_stock"] else qty.get(vid, 1)
        variants[z] = {
            "label": name,
            "price": prices.get(vid),
            "stock": stock,
            "image": images.get(z),
        }

    if not any(v.get("image") for v in variants.values()):
        img_m = re.search(r'"image":\{"_type":"Image"[^}]*"URL":"([^"]+)"', html)
        if img_m:
            fallback = img_m.group(1).replace("\\u002F", "/")
            fallback = re.sub(r"/s-l\d+\.", "/s-l1600.", fallback)
            for z in variants:
                if not variants[z].get("image"):
                    variants[z]["image"] = fallback

    return {"title": title, "variants": variants}


async def dismiss_overlays(page):
    for sel in [
        "#gdpr-banner-accept",
        'button:has-text("Alle akzeptieren")',
        'button:has-text("Akzeptieren")',
        '[data-testid="x-item-condition-max-view"] button[aria-label="Schließen"]',
        ".lightbox-dialog__close",
    ]:
        btn = page.locator(sel).first
        if await btn.count() > 0 and await btn.is_visible():
            try:
                await btn.click(timeout=2000)
                await page.wait_for_timeout(300)
            except Exception:
                pass


async def select_condition(page, label):
    await dismiss_overlays(page)
    for sel in [
        'select[id^="msku-sel"]',
        'button[id^="msku-sel"]',
        '[data-testid="ux-msku"] button',
    ]:
        el = page.locator(sel).first
        if await el.count() == 0 or not await el.is_visible():
            continue
        tag = await el.evaluate("e => e.tagName")
        if tag == "SELECT":
            await el.select_option(label=label)
            await page.wait_for_timeout(800)
            return True
        await el.click(force=True, timeout=5000)
        await page.wait_for_timeout(400)
        for opt_sel in [
            f'li[role="option"]:has-text("{label}")',
            f'[role="menuitem"]:has-text("{label}")',
        ]:
            opt = page.locator(opt_sel).first
            if await opt.count() > 0:
                await opt.click(force=True, timeout=5000)
                await page.wait_for_timeout(800)
                return True
        return False
    return False


async def carousel_image(page):
    return await page.evaluate(
        """() => {
          const img = document.querySelector('.ux-image-carousel-item img');
          if (!img) return null;
          let src = img.src || img.getAttribute('data-src') || '';
          return src.replace(/s-l\\d+\\./, 's-l1600.').replace(/\\?.*$/, '');
        }"""
    )


async def scrape_one(page, item_id):
    url = f"https://www.ebay.de/itm/{item_id}"
    await page.goto(url, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(3500)
    await dismiss_overlays(page)

    html = await page.content()
    if "Error Page" in html or "menuItemMap" not in html:
        await page.wait_for_timeout(3000)
        html = await page.content()

    data = parse_listing(html, item_id)
    if not data["title"]:
        title = await page.title()
        data["title"] = title.split(" | ")[0].strip() if " | " in title else title

    for z, v in data["variants"].items():
        if v.get("stock", 0) <= 0:
            v["image"] = None
            continue
        label = Z_TO_COND[z]
        try:
            if await select_condition(page, label):
                img = await carousel_image(page)
                if img:
                    v["image"] = img
        except Exception:
            pass

    return data


async def main():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            locale="de-DE",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
        )
        page = await context.new_page()
        await page.goto("https://www.ebay.de/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(1500)
        for item_id in IDS:
            print(f"Scraping {item_id}...", file=sys.stderr)
            try:
                results[item_id] = await scrape_one(page, item_id)
                print(f"OK {item_id}: {results[item_id]['title']}", file=sys.stderr)
            except Exception as e:
                results[item_id] = {"error": str(e)}
                print(f"ERR {item_id}: {e}", file=sys.stderr)
        await browser.close()
    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main())
