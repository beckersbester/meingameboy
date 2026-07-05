#!/usr/bin/env python3
"""Scrape first carousel product photo + stock/prices from eBay listings."""
import asyncio
import json
import re
import sys
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
IDS = {
    "298482294642": ("pb", "PB", "Pokémon Blau"),
    "298482300934": ("pr", "PR", "Pokémon Rot"),
    "298482317876": ("pg", "PG", "Pokémon Gelb"),
    "298482323551": ("pgo", "PGO", "Pokémon Gold"),
    "298482326596": ("psi", "PSI", "Pokémon Silber"),
    "298482343251": ("pk", "PK", "Pokémon Kristall"),
}
COND = {"Akzeptabel": "z1", "Gut": "z2", "Sehr Gut": "z3", "Neuwertig": "z4"}


def hi_res(url):
    if not url:
        return None
    url = url.split("?")[0]
    return re.sub(r"/s-l\d+\.", "/s-l1600.", url)


async def dismiss(page):
    for sel in [
        "#gdpr-banner-accept",
        'button:has-text("Alle akzeptieren")',
        'button:has-text("Akzeptieren")',
    ]:
        btn = page.locator(sel).first
        if await btn.count() > 0 and await btn.is_visible():
            try:
                await btn.click(timeout=2000)
                await page.wait_for_timeout(300)
            except Exception:
                pass


async def first_product_image(page):
    """First carousel slide = actual product photo (later slides may be ads)."""
    return await page.evaluate(
        """() => {
          const img = document.querySelector('.ux-image-carousel-item img[data-zoom-src]')
            || document.querySelector('.ux-image-carousel-item img');
          if (!img) return null;
          const zoom = img.getAttribute('data-zoom-src') || img.src || '';
          return zoom.replace(/s-l\\d+\\./, 's-l1600.').split('?')[0];
        }"""
    )


def parse_html(html):
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

    variants = {}
    for name, z in COND.items():
        if name not in menu:
            continue
        vid = menu[name]["var_id"]
        stock = 0 if menu[name]["out_of_stock"] else qty.get(vid, 1)
        variants[z] = {"price": prices.get(vid), "stock": stock, "image": None}
    return variants


async def scrape_one(page, item_id):
    url = f"https://www.ebay.de/itm/{item_id}"
    await page.goto(url, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(4000)
    await dismiss(page)
    try:
        await page.wait_for_selector(".ux-image-carousel-item img", timeout=15000)
    except Exception:
        await page.wait_for_timeout(3000)
    html = await page.content()
    if "menuItemMap" not in html:
        await page.wait_for_timeout(3000)
        html = await page.content()
    variants = parse_html(html)
    product_img = hi_res(await first_product_image(page))
    if not product_img:
        raise RuntimeError(f"no carousel image for {item_id}")
    for z, v in variants.items():
        v["image"] = product_img if v.get("stock", 0) > 0 else None
    return variants, product_img


async def main():
    sync = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            locale="de-DE",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
        )
        for item_id, (shop_id, code, titel) in IDS.items():
            print(f"scraping {item_id} ({shop_id})...", file=sys.stderr)
            try:
                variants, img = await scrape_one(page, item_id)
            except Exception as exc:
                print(f"  ERROR: {exc}", file=sys.stderr)
                prev = json.loads((ROOT / "scripts" / "ebay_sync_data.json").read_text(encoding="utf-8"))
                variants = prev.get(item_id, {}).get("variants", {})
                img = None
            print(f"  product image: {img}", file=sys.stderr)
            for z, v in sorted(variants.items()):
                print(f"  {z}: stock={v['stock']} price={v.get('price')}", file=sys.stderr)
            sync[item_id] = {
                "shopId": shop_id,
                "bildCode": code,
                "titel": titel,
                "variants": variants,
            }
        await browser.close()
    out = ROOT / "scripts" / "ebay_sync_data.json"
    out.write_text(json.dumps(sync, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("wrote", out)


if __name__ == "__main__":
    asyncio.run(main())
