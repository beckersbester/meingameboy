"""Freistellen aller Produktbilder → assets/products/{id}-float.png"""
from pathlib import Path
from rembg import remove
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "products"
OUT.mkdir(parents=True, exist_ok=True)

JOBS = [
    ("color-wario", "WhatsApp Image 2026-06-07 at 20.16.09.png"),
    ("classic", "WhatsApp Image 2026-05-21 at 18.26.14 (5).png"),
    ("pocket-orange", "WhatsApp Image 2026-06-07 at 20.16.13 (9).png"),
    ("pocket-squirtle", "WhatsApp Image 2026-06-07 at 20.16.13 (5).png"),
    ("pocket-charizard", "WhatsApp Image 2026-06-07 at 20.16.13 (3).png"),
    ("pocket-pikachu", "WhatsApp Image 2026-06-07 at 20.16.13 (1).png"),
    ("pocket-classic", "WhatsApp Image 2026-06-07 at 20.16.10.png"),
    ("color-mario", "WhatsApp Image 2026-06-07 at 20.16.09 (2).png"),
    ("classic-black-ips", "WhatsApp Image 2026-06-07 at 20.29.29.png"),
    ("classic-red", "WhatsApp Image 2026-05-21 at 18.26.14 (3).png"),
    ("pocket-transparent", "WhatsApp Image 2026-05-21 at 18.26.13 (14).png"),
    ("color-pokemon", "WhatsApp Image 2026-05-21 at 18.26.13 (18).png"),
    ("color-charizard-orange", "WhatsApp Image 2026-05-21 at 18.26.13 (16).png"),
    ("color-yellow", "WhatsApp Image 2026-05-21 at 18.48.20.png"),
    ("classic-grau-ips", "WhatsApp Image 2026-06-08 at 10.25.40.png"),
    ("gba-gengar", "gba-gengar-edition.png"),
    ("gba-charmander", "gba-charmander-edition.png"),
    ("kategorie-alle", "WhatsApp Image 2026-06-07 at 20.29.28.png"),
]

for produkt_id, src_name in JOBS:
    out_path = OUT / f"{produkt_id}-float.png"
    src_path = ROOT / src_name
    if out_path.exists():
        print("skip", produkt_id)
        continue
    if not src_path.exists():
        print("MISSING", src_name)
        continue
    print("process", produkt_id, "…")
    out = remove(Image.open(src_path))
    out.save(out_path)
    print("  ->", out_path.name)

print("done")
