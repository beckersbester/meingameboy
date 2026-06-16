"""Shop-Produktbilder auf freigestellte PNGs + Float-Wrapper umstellen."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
shop = (ROOT / "shop.html").read_text(encoding="utf-8")

IDS = [
    "color-wario", "classic", "pocket-orange", "pocket-squirtle",
    "pocket-charizard", "pocket-pikachu", "pocket-classic", "color-mario",
    "classic-black-ips", "classic-red", "pocket-transparent", "color-pokemon",
    "color-charizard-orange", "color-yellow", "classic-grau-ips",
    "gba-gengar", "gba-charmander",
]

for pid in IDS:
    float_src = f"assets/products/{pid}-float.png"
    block_re = re.compile(
        rf'(<div class="produkt[^"]*" data-produkt-id="{re.escape(pid)}"[^>]*>.*?)(</div>\s*\n\s*<div class="produkt|\Z)',
        re.DOTALL,
    )
    match = block_re.search(shop)
    if not match:
        print("WARN block", pid)
        continue
    block = match.group(1)
    if "produkt-bild--float" in block:
        print("skip", pid)
        continue
    img_re = re.compile(
        r'  <a href="[^"]*" target="_blank">\s*\n'
        r'    <img src="[^"]*" alt="([^"]*)">\s*\n'
        r'  </a>',
    )
    img_match = img_re.search(block)
    if not img_match:
        print("WARN img", pid)
        continue
    alt = img_match.group(1)
    replacement = (
        f'  <div class="produkt-bild produkt-bild--float">\n'
        f'    <a href="{float_src}" target="_blank">\n'
        f'      <img src="{float_src}" alt="{alt}">\n'
        f'    </a>\n'
        f'  </div>'
    )
    new_block = img_re.sub(replacement, block, count=1)
    shop = shop.replace(block, new_block, 1)
    print("patched", pid)

(ROOT / "shop.html").write_text(shop, encoding="utf-8")
print("shop.html updated")
