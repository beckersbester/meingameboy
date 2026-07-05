#!/usr/bin/env python3
"""Fetch per-listing main image URLs from eBay HTML (no Playwright)."""
import json
import re
import urllib.request
from pathlib import Path

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


def fetch_html(item_id):
    req = urllib.request.Request(
        f"https://www.ebay.de/itm/{item_id}",
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", "replace")


def normalize_url(url):
    url = url.replace("\\u002F", "/")
    return re.sub(r"/s-l\d+\.", "/s-l1600.", url)


def parse_listing(html):
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
        url = normalize_url(m.group(2))
        for name, z in COND.items():
            if name in menu and menu[name]["var_id"] == vid:
                images[z] = url

    main_m = re.search(r'"image":\{"_type":"Image"[^}]*"URL":"([^"]+)"', html)
    main_img = normalize_url(main_m.group(1)) if main_m else None

    variants = {}
    for name, z in COND.items():
        if name not in menu:
            continue
        vid = menu[name]["var_id"]
        stock = 0 if menu[name]["out_of_stock"] else qty.get(vid, 1)
        img = images.get(z) or main_img
        variants[z] = {
            "price": prices.get(vid),
            "stock": stock,
            "image": img if stock > 0 else None,
        }
    return variants, main_img


def main():
    sync = json.loads((ROOT / "scripts" / "ebay_sync_data.json").read_text(encoding="utf-8"))
    for item_id, (shop_id, code, titel) in IDS.items():
        print(f"fetch {item_id} ({shop_id})...")
        html = fetch_html(item_id)
        variants, main_img = parse_listing(html)
        print(f"  main: {main_img}")
        for z, v in variants.items():
            print(f"  {z}: stock={v['stock']} price={v['price']} img={(v['image'] or '')[:70]}")
        sync[item_id] = {
            "shopId": shop_id,
            "bildCode": code,
            "titel": titel,
            "variants": variants,
        }
    out = ROOT / "scripts" / "ebay_sync_data.json"
    out.write_text(json.dumps(sync, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("wrote", out)


if __name__ == "__main__":
    main()
