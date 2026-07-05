#!/usr/bin/env python3
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
META = json.loads((ROOT / "scripts" / "ebay_sync_meta.json").read_text(encoding="utf-8"))

SPIEL_FEATURES = [
    "Original Game Boy Modul",
    "Speichert (neue Batterie)",
    "Technisch geprüft · sofort spielbereit",
    "Kostenloser Versand",
]
NEW_IDS = {"pgo", "psi"}
Z_LABEL = {"z1": "Akzeptabel", "z2": "Gut", "z3": "Sehr gut", "z4": "Neuwertig"}
SPIEL_ORDER = [
    "sm1", "sm2", "sm3", "pb", "pr", "pg", "pgo", "psi", "pk", "pt",
    "dbz", "zla", "t", "pfe", "pse", "pre", "pbe",
]


def spiel_entry(reihenfolge, sid, meta):
    return {
        "reihenfolge": reihenfolge,
        "typ": "spiel",
        "id": sid,
        "titel": meta["titel"],
        "bild": meta["bild"],
        "klassen": "spiele spiel-variante",
        "features": SPIEL_FEATURES[:],
        "aktiv": "ja",
        "badge": "Pokémon",
        "startZustand": meta["startZustand"],
        "bildCode": meta["code"],
        "bildExt": meta["bildExt"],
    }


def update_katalog():
    katalog = json.loads((ROOT / "katalog.json").read_text(encoding="utf-8"))
    by_id = {item["id"]: item for item in katalog if item.get("id")}
    for sid, meta in META.items():
        if sid in by_id:
            entry = by_id[sid]
        else:
            entry = spiel_entry(0, sid, meta)
            by_id[sid] = entry
        entry["bild"] = meta["bild"]
        entry["startZustand"] = meta["startZustand"]
        entry["bildCode"] = meta["code"]
        entry["bildExt"] = meta["bildExt"]
        entry["titel"] = meta["titel"]
    konsolen = sorted([i for i in katalog if i.get("typ") == "konsolen"], key=lambda x: x["reihenfolge"])
    spiele = []
    n = len(konsolen) + 1
    for sid in SPIEL_ORDER:
        if sid not in by_id:
            continue
        item = by_id[sid]
        item["reihenfolge"] = n
        spiele.append(item)
        n += 1
    new_katalog = konsolen + spiele
    (ROOT / "katalog.json").write_text(json.dumps(new_katalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return new_katalog


def update_bestand():
    bestand = json.loads((ROOT / "bestand.json").read_text(encoding="utf-8"))
    for meta in META.values():
        bestand.update(meta["bestand"])
    (ROOT / "bestand.json").write_text(json.dumps(bestand, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def patch_block(text, start_marker, end_marker, mutator):
    start = text.index(start_marker)
    end = text.index(end_marker, start)
    block = text[start:end]
    block = mutator(block)
    return text[:start] + block + text[end:]


def patch_shop_preise(text):
    def mutator(block):
        for sid, meta in META.items():
            lines = [f"  {sid}: {{"]
            for z in ["z1", "z2", "z3", "z4"]:
                if z in meta["preise"]:
                    lines.append(f"    {z}: '{meta['preise'][z]}',")
            lines.append("  },")
            new_entry = "\n".join(lines) + "\n"
            block = re.sub(rf"  {sid}: \{{[\s\S]*?\}},\n", new_entry, block, count=1)
        return block

    return patch_block(text, "const SPIEL_PREISE = {", "\n};", mutator)


def patch_bestand_map(text, marker):
    def mutator(block):
        for meta in META.values():
            for key, val in meta["bestand"].items():
                if re.search(rf"  '{re.escape(key)}': \d+,?\n", block):
                    block = re.sub(rf"  '{re.escape(key)}': \d+,?\n", f"  '{key}': {val},\n", block, count=1)
                else:
                    block = block.rstrip().rstrip(",")
                    if not block.endswith("{"):
                        block += ","
                    block += f"\n  '{key}': {val},"
        return block + "\n"

    return patch_block(text, marker, "\n};", mutator)


def patch_shop_html():
    text = (ROOT / "shop.html").read_text(encoding="utf-8")
    text = patch_shop_preise(text)
    bestand = json.loads((ROOT / "bestand.json").read_text(encoding="utf-8"))
    bestand_block = "\n".join(f"  '{k}': {v}," for k, v in sorted(bestand.items(), key=lambda x: x[0])) + "\n"
    text = re.sub(
        r"const BESTAND_DEFAULT = \{[\s\S]*?\n\};",
        "const BESTAND_DEFAULT = {\n" + bestand_block + "};",
        text,
        count=1,
    )
    if "pgo: 'pokemon'" not in text:
        text = text.replace(
            "  pbe: 'pokemon',",
            "  pbe: 'pokemon',\n  pgo: 'pokemon', psi: 'pokemon',",
        )
    text = text.replace(
        "pokemon: 'Pokémon Blau, Rot, Gelb, Kristall, Feuerrot, Saphir, Rubin, Blattgrün & Trading Card – Originalmodule.',",
        "pokemon: 'Pokémon Blau, Rot, Gelb, Gold, Silber, Kristall, Feuerrot, Saphir, Rubin, Blattgrün & Trading Card – Originalmodule.',",
    )
    (ROOT / "shop.html").write_text(text, encoding="utf-8")


def price_num(s):
    return float(s.replace(" €", "").replace(",", "."))


def patch_lager_api():
    text = (ROOT / "google-apps-script" / "lager-api.gs").read_text(encoding="utf-8")
    bestand = json.loads((ROOT / "bestand.json").read_text(encoding="utf-8"))
    bestand_block = "\n".join(f"  '{k}': {v}," for k, v in sorted(bestand.items(), key=lambda x: x[0])) + "\n"
    text = re.sub(
        r"const BESTAND_START = \{[\s\S]*?\n\};",
        "const BESTAND_START = {\n" + bestand_block + "};",
        text,
        count=1,
    )

    def patch_section(section, mutator):
        nonlocal text
        start = text.index(f"const {section} = {{")
        end = text.index("\n};", start)
        text = text[:start] + mutator(text[start:end]) + text[end:]

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
        return block

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
        return block

    patch_section("PREISE_START", patch_preise)
    patch_section("PRODUKT_NAMEN", patch_namen)
    (ROOT / "google-apps-script" / "lager-api.gs").write_text(text, encoding="utf-8")


def patch_lager_js():
    text = (ROOT / "assets" / "lager.js").read_text(encoding="utf-8")
    if "pgo: 'PGO'" not in text:
        text = text.replace("  pbe: 'PBE',", "  pbe: 'PBE',\n  pgo: 'PGO', psi: 'PSI',")
    for sid, meta in META.items():
        for z, ext in meta["bildExt"].items():
            line = f"  '{sid}-{z}': '{ext}',"
            if f"'{sid}-{z}'" in text:
                text = re.sub(rf"  '{sid}-{z}': '[^']*',", line, text)
            else:
                text = text.replace("  'pbe-z3': 'jpeg'", "  'pbe-z3': 'jpeg',\n" + line)
        for z in ["z1", "z2", "z3", "z4"]:
            key = f"spiel-{sid}-{z}"
            name = meta["titel"] + " – " + Z_LABEL[z]
            line = f"  '{key}': '{name}',"
            if f"'{key}':" in text:
                text = re.sub(rf"  '{re.escape(key)}': '[^']*',", line, text)
            elif sid in NEW_IDS and z in meta["bildExt"]:
                text = text.replace(
                    "  'spiel-pbe-z4': 'Pokémon Blattgrüne Edition – Neuwertig',",
                    "  'spiel-pbe-z4': 'Pokémon Blattgrüne Edition – Neuwertig',\n" + line,
                )
        for z in meta["bildExt"]:
            key = f"spiel-{sid}-{z}"
            line = f"  '{key}': spielBildPfadLager('{sid}', '{z}'),"
            if key not in text:
                text = text.replace(
                    "  'spiel-pbe-z4': spielBildPfadLager('pbe', 'z4')",
                    "  'spiel-pbe-z4': spielBildPfadLager('pbe', 'z4'),\n" + line,
                )
    (ROOT / "assets" / "lager.js").write_text(text, encoding="utf-8")


def rebuild_sheet_rows(katalog):
    rows = []
    for item in sorted(katalog, key=lambda x: x.get("reihenfolge", 0)):
        if item.get("typ") not in ("spiel", "konsolen"):
            continue
        bild_ext = "|".join(f"{k}:{v}" for k, v in (item.get("bildExt") or {}).items())
        rows.append([
            item.get("reihenfolge", 0), item.get("typ", ""), item.get("id", ""), item.get("titel", ""),
            item.get("bild", ""), item.get("klassen", ""), item.get("badge", ""),
            "|".join(item.get("features") or []), item.get("startZustand", ""),
            item.get("bildCode", ""), bild_ext, item.get("aktiv", "ja"),
        ])
    gs_lines = ["  [" + ", ".join(json.dumps(c, ensure_ascii=False) for c in row) + "]" for row in rows]
    gs_block = "const KATALOG_START_ROWS = [\n" + ",\n".join(gs_lines) + "\n];"
    (ROOT / "scripts" / "katalog-sheet-rows.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    start_txt = ROOT / "scripts" / "katalog-start.gs.txt"
    header = start_txt.read_text(encoding="utf-8").split("const KATALOG_START_ROWS")[0]
    start_txt.write_text(header + gs_block + "\n", encoding="utf-8")
    api = ROOT / "google-apps-script" / "lager-api.gs"
    api.write_text(re.sub(r"const KATALOG_START_ROWS = \[[\s\S]*?\];", gs_block, api.read_text(encoding="utf-8"), count=1), encoding="utf-8")


def main():
    katalog = update_katalog()
    update_bestand()
    patch_shop_html()
    patch_lager_api()
    patch_lager_js()
    rebuild_sheet_rows(katalog)
    subprocess.check_call([sys.executable, str(ROOT / "scripts" / "embed-katalog-fallback.py")])
    print("done")


if __name__ == "__main__":
    main()
