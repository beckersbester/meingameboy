#!/usr/bin/env python3
import json
import os
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "scripts" / "ebay_sync_data.json"
PRODUCTS = ROOT / "assets" / "products"
PRIO = ["z4", "z3", "z2", "z1"]


def ext_from_url(url):
    if not url:
        return None
    m = re.search(r"\.(jpe?g|webp|png)(?:\?|$)", url, re.I)
    return m.group(1).lower().replace("jpeg", "jpeg") if m else "jpeg"


def fmt_price(v):
    s = f"{v:.2f}".replace(".", ",")
    return f"{s} €"


def preferred_z(variants):
    for z in PRIO:
        if variants.get(z, {}).get("stock", 0) > 0:
            return z
    for z in PRIO:
        if variants.get(z, {}).get("image"):
            return z
    return "z3"


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    print(f"saved {dest.name} ({len(data)} bytes)")


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    meta = {}
    for item in data.values():
        sid = item["shopId"]
        code = item["bildCode"]
        variants = item["variants"]
        bild_ext = {}
        start = preferred_z(variants)
        for z in ["z1", "z2", "z3", "z4"]:
            v = variants[z]
            url = v.get("image")
            if url:
                ext = ext_from_url(url)
                if ext == "jpg":
                    ext = "jpeg"
                fname = f"{code}_{z.upper()}.{ext}"
                download(url, PRODUCTS / fname)
                bild_ext[z] = ext
        if not bild_ext:
            print(f"WARN no images for {sid}")
        start_ext = bild_ext.get(start, "jpeg")
        meta[sid] = {
            "code": code,
            "titel": item["titel"],
            "startZustand": start,
            "bild": f"assets/products/{code}_{start.upper()}.{start_ext}",
            "bildExt": bild_ext,
            "preise": {z: fmt_price(variants[z]["price"]) for z in variants if variants[z].get("price") is not None},
            "bestand": {f"spiel-{sid}-{z}": variants[z]["stock"] for z in variants},
        }
    (ROOT / "scripts" / "ebay_sync_meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print("wrote ebay_sync_meta.json")


if __name__ == "__main__":
    main()
