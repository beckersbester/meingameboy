"""Extract product catalog from shop.html into katalog.json."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "shop.html").read_text(encoding="utf-8")
start = html.index('<div class="produkte">')
end = html.index('<p class="keine-treffer"')
chunk = html[start:end]
blocks = re.findall(
    r'(<div class="produkt [^"]+"[^>]*>.*?)(?=\n\n<div class="produkt|\Z)',
    chunk,
    re.DOTALL,
)

SPIEL_BILD_EXT = {
    "sm2-z1": "jpeg",
    "pb-z2": "jpeg", "pb-z4": "jpeg",
    "pr-z1": "jpg", "pr-z3": "jpeg",
    "pg-z4": "jpeg",
    "pk-z3": "jpeg",
    "pt-z3": "jpeg",
    "dbz-z3": "jpeg",
    "zla-z2": "jpeg", "zla-z3": "jpg",
    "t-z2": "jpeg", "t-z3": "jpeg",
}

items = []
for i, b in enumerate(blocks):
    m = re.search(r'class="produkt ([^"]+)"', b)
    klassen = m.group(1) if m else ""
    pid = re.search(r'data-produkt-id="([^"]+)"', b)
    spiel = re.search(r'data-spiel="([^"]+)"', b)
    h3 = re.search(r"<h3>([^<]+)</h3>", b)
    img = re.search(
        r'<img class="spiel-bild" src="([^"]+)" alt="([^"]+)"', b
    ) or re.search(r'<img src="([^"]+)" alt="([^"]+)"', b)
    feats = re.findall(r'<ul class="features">(.*?)</ul>', b, re.DOTALL)
    features = re.findall(r"<li>(.*?)</li>", feats[0]) if feats else []
    features = [re.sub(r"&amp;", "&", f) for f in features]
    badge = re.search(r'badge-produkt badge-spiel">([^<]+)', b)
    sel = re.search(r'<option value="(z[1-4])" selected>', b)
    start_z = sel.group(1) if sel else "z3"
    typ = "spiel" if "spiel-variante" in klassen else "konsolen"
    item = {
        "reihenfolge": i + 1,
        "typ": typ,
        "id": spiel.group(1) if spiel else (pid.group(1) if pid else ""),
        "titel": h3.group(1) if h3 else "",
        "bild": img.group(1) if img else "",
        "klassen": klassen,
        "features": features,
        "aktiv": "ja",
    }
    if badge:
        item["badge"] = badge.group(1)
    if typ == "spiel":
        item["startZustand"] = start_z
        if img:
            item["bildCode"] = Path(img.group(1)).stem.rsplit("_", 1)[0]
        ext_map = {
            k.split("-", 1)[1]: v
            for k, v in SPIEL_BILD_EXT.items()
            if k.startswith(spiel.group(1) + "-")
        } if spiel else {}
        if ext_map:
            item["bildExt"] = ext_map
    items.append(item)

(ROOT / "katalog.json").write_text(
    json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(f"Wrote {len(items)} items to katalog.json")
