#!/usr/bin/env python3
"""Fix corrupted lager-api.gs and lager.js after eBay sync."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
META = json.loads((ROOT / "scripts" / "ebay_sync_meta.json").read_text(encoding="utf-8"))
BESTAND = json.loads((ROOT / "bestand.json").read_text(encoding="utf-8"))
Z_LABEL = {"z1": "Akzeptabel", "z2": "Gut", "z3": "Sehr gut", "z4": "Neuwertig"}


def price_num(s):
    return float(s.replace(" €", "").replace(",", "."))


def lines_map(data, fmt):
    return "\n".join(fmt(k, v) for k, v in sorted(data.items(), key=lambda x: x[0])) + "\n"


def fix_lager_api():
    path = ROOT / "google-apps-script" / "lager-api.gs"
    text = path.read_text(encoding="utf-8")

    bestand_block = lines_map(BESTAND, lambda k, v: f"  '{k}': {v},")
    text = re.sub(
        r"const BESTAND_START = \{[\s\S]*?\n\};",
        "const BESTAND_START = {\n" + bestand_block + "};",
        text,
        count=1,
    )

    # patch PREISE_START spiel keys from meta
    def patch_preise(block):
        for sid, meta in META.items():
            for z in ["z1", "z2", "z3", "z4"]:
                key = f"spiel-{sid}-{z}"
                if z not in meta["preise"]:
                    continue
                val = price_num(meta["preise"][z])
                line = f"  '{key}': {val:.2f},\n"
                if re.search(rf"  '{re.escape(key)}':", block):
                    block = re.sub(rf"  '{re.escape(key)}': [0-9.]+,\n", line, block, count=1)
                else:
                    block = block.rstrip() + "\n" + line
        block = re.sub(
            r"  'spiel-pbe-z4': 199\.99  'spiel-pgo-z1'",
            "  'spiel-pbe-z4': 199.99,\n  'spiel-pgo-z1'",
            block,
        )
        return block

    start = text.index("const PREISE_START = {")
    end = text.index("\n};", start)
    text = text[:start] + patch_preise(text[start:end]) + text[end:]

    # patch PRODUKT_NAMEN
    def patch_namen(block):
        for sid, meta in META.items():
            for z in ["z1", "z2", "z3", "z4"]:
                key = f"spiel-{sid}-{z}"
                name = meta["titel"] + " – " + Z_LABEL[z]
                line = f"  '{key}': '{name}',\n"
                if re.search(rf"  '{re.escape(key)}':", block):
                    block = re.sub(rf"  '{re.escape(key)}': '[^']*',?\n", line, block, count=1)
                else:
                    block = block.rstrip() + "\n" + line
        block = re.sub(
            r"  'spiel-pbe-z4': 'Pokémon Blattgrüne Edition – Neuwertig'  'spiel-pgo-z1'",
            "  'spiel-pbe-z4': 'Pokémon Blattgrüne Edition – Neuwertig',\n  'spiel-pgo-z1'",
            block,
        )
        return block

    start = text.index("const PRODUKT_NAMEN = {")
    end = text.index("\n};", start)
    text = text[:start] + patch_namen(text[start:end]) + text[end:]
    path.write_text(text, encoding="utf-8")


def fix_lager_js():
    path = ROOT / "assets" / "lager.js"
    text = path.read_text(encoding="utf-8")
    text = text.replace(",,", ",")
    if "pgo: 'PGO'" not in text:
        text = text.replace(
            "  pbe: 'PBE',",
            "  pbe: 'PBE',\n  pgo: 'PGO', psi: 'PSI',",
        )
    # rebuild SPIEL_BILD_EXT entries for synced games
    for sid, meta in META.items():
        for z, ext in meta["bildExt"].items():
            key = f"'{sid}-{z}'"
            line = f"  '{sid}-{z}': '{ext}',"
            if key in text:
                text = re.sub(rf"  '{sid}-{z}': '[^']*',", line, text)
            else:
                text = text.replace(
                    "  'pbe-z3': 'jpeg'",
                    "  'pbe-z3': 'jpeg',\n" + line,
                )
        for z in ["z1", "z2", "z3", "z4"]:
            key = f"spiel-{sid}-{z}"
            name = meta["titel"] + " – " + Z_LABEL[z]
            line = f"  '{key}': '{name}',"
            if f"'{key}':" in text:
                text = re.sub(rf"  '{re.escape(key)}': '[^']*',", line, text)
        for z in meta["bildExt"]:
            key = f"spiel-{sid}-{z}"
            line = f"  '{key}': spielBildPfadLager('{sid}', '{z}'),"
            if key not in text:
                text = text.replace(
                    "  'spiel-pbe-z4': spielBildPfadLager('pbe', 'z4')",
                    "  'spiel-pbe-z4': spielBildPfadLager('pbe', 'z4'),\n" + line,
                )
    path.write_text(text, encoding="utf-8")


def fix_shop_preise():
    path = ROOT / "shop.html"
    text = path.read_text(encoding="utf-8")
    for sid, meta in META.items():
        if sid in ("pb", "pr", "pg", "pk") and f"  {sid}: {{" in text:
            continue
        if sid in ("pgo", "psi") and f"  {sid}: {{" not in text:
            insert = f"  {sid}: {{\n"
            for z in ["z1", "z2", "z3", "z4"]:
                insert += f"    {z}: '{meta['preise'][z]}',\n"
            insert += "  },\n"
            text = text.replace("  pbe: {", insert + "  pbe: {", 1)
    if "pgo: 'pokemon'" not in text:
        text = text.replace(
            "  pbe: 'pokemon',",
            "  pbe: 'pokemon',\n  pgo: 'pokemon', psi: 'pokemon',",
        )
    path.write_text(text, encoding="utf-8")


def main():
    fix_lager_api()
    fix_lager_js()
    fix_shop_preise()
    print("fixed")


if __name__ == "__main__":
    main()
