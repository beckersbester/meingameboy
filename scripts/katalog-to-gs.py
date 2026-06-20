"""Build Katalog sheet rows for lager-api.gs from katalog.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
items = json.loads((ROOT / "katalog.json").read_text(encoding="utf-8"))
items = [i for i in items if i.get("id") and i.get("titel")]
for i, item in enumerate(items, 1):
    item["reihenfolge"] = i

rows = []
for item in items:
    klassen = item["klassen"].replace(" ausverkauft", "")
    features = "|".join(item["features"])
    ext = item.get("bildExt") or {}
    bild_ext = "|".join(f"{k}:{v}" for k, v in sorted(ext.items()))
    rows.append([
        item["reihenfolge"],
        item["typ"],
        item["id"],
        item["titel"],
        item["bild"],
        klassen,
        item.get("badge", ""),
        features,
        item.get("startZustand", ""),
        item.get("bildCode", ""),
        bild_ext,
        item.get("aktiv", "ja"),
    ])

(ROOT / "katalog.json").write_text(
    json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8"
)
out = ROOT / "scripts" / "katalog-sheet-rows.json"
out.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"{len(rows)} rows -> {out}")
