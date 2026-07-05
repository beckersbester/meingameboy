#!/usr/bin/env python3
"""Sync katalog.json and related files with assets/products/Gameboy|Games layout."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GAMES = ROOT / "assets" / "products" / "Games"
GAMEBOY = ROOT / "assets" / "products" / "Gameboy"
FLOAT = ROOT / "assets" / "products" / "float"
PRIO = ["z4", "z3", "z2", "z1"]

# Erscheinungsjahr (EU), zweites Feld = Reihenfolge bei gleichem Jahr
SPIEL_SORT = {
    "t": (1990, 1),
    "sm1": (1990, 2),
    "sm2": (1992, 1),
    "zla": (1993, 1),
    "sm3": (1994, 1),
    "pb": (1998, 1),
    "pr": (1998, 2),
    "pg": (1999, 1),
    "pt": (2000, 1),
    "pgo": (2000, 2),
    "psi": (2000, 3),
    "pk": (2001, 1),
    "pre": (2003, 1),
    "pse": (2003, 2),
    "dbz": (2003, 3),
    "pfe": (2004, 1),
    "pbe": (2004, 2),
}


def ext_name(path: Path) -> str:
    return path.suffix.lower().lstrip(".")


def find_spiel_file(code: str, z: str) -> Path | None:
    for folder in (GAMES, GAMEBOY):
        for suffix in ("webp", "jpeg", "jpg", "png"):
            candidate = folder / f"{code}_{z.upper()}.{suffix}"
            if candidate.is_file():
                return candidate
    return None


def rel_asset(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def scan_game_images():
    """Return {CODE: {z1: (ext, rel_path), ...}}."""
    by_code = {}
    # Gameboy zuerst, Games überschreibt (Spiele liegen in Games/)
    for folder in (GAMEBOY, GAMES):
        if not folder.is_dir():
            continue
        for f in folder.iterdir():
            if not f.is_file():
                continue
            m = re.match(r"^([A-Z0-9]+)_([Z][1-4])\.(jpe?g|webp|png)$", f.name, re.I)
            if not m:
                continue
            code, z = m.group(1).upper(), m.group(2).lower()
            by_code.setdefault(code, {})[z] = {
                "ext": ext_name(f),
                "path": rel_asset(f),
            }
    return by_code


def preferred_z(bild_ext, start=None):
    for z in PRIO:
        if z in bild_ext:
            return z
    return start or "z3"


def sync_katalog():
    images = scan_game_images()
    katalog = json.loads((ROOT / "katalog.json").read_text(encoding="utf-8"))

    for item in katalog:
        if item.get("typ") == "konsolen":
            old = item.get("bild", "")
            name = Path(old).name
            candidate = GAMEBOY / name
            if candidate.is_file():
                item["bild"] = rel_asset(candidate)
            continue

        if item.get("typ") != "spiel":
            continue

        code = (item.get("bildCode") or item.get("id", "")).upper()
        variant_map = images.get(code, {})
        if not variant_map:
            print(f"WARN: no images for {item.get('id')} ({code})")
            continue

        ext_map = {z: v["ext"] for z, v in variant_map.items()}
        pfade = {z: v["path"] for z, v in variant_map.items()}
        item["bildExt"] = ext_map
        item["bildPfade"] = pfade
        start = preferred_z(ext_map, item.get("startZustand"))
        item["startZustand"] = start
        item["bild"] = variant_map[start]["path"]

    konsolen = [i for i in katalog if i.get("typ") == "konsolen"]
    spiele = [i for i in katalog if i.get("typ") == "spiel"]
    spiele.sort(key=lambda i: SPIEL_SORT.get(i.get("id", ""), (9999, 9999)))
    n = len(konsolen) + 1
    for item in spiele:
        item["reihenfolge"] = n
        n += 1
    katalog = konsolen + spiele

    (ROOT / "katalog.json").write_text(
        json.dumps(katalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return katalog


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
    (ROOT / "scripts" / "katalog-sheet-rows.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    start_txt = ROOT / "scripts" / "katalog-start.gs.txt"
    header = start_txt.read_text(encoding="utf-8").split("const KATALOG_START_ROWS")[0]
    start_txt.write_text(header + gs_block + "\n", encoding="utf-8")
    api = ROOT / "google-apps-script" / "lager-api.gs"
    api.write_text(
        re.sub(r"const KATALOG_START_ROWS = \[[\s\S]*?\];", gs_block, api.read_text(encoding="utf-8"), count=1),
        encoding="utf-8",
    )


def patch_lager_js(katalog):
    lager_path = ROOT / "assets" / "lager.js"
    text = lager_path.read_text(encoding="utf-8")

    ext_lines = []
    for item in katalog:
        if item.get("typ") != "spiel":
            continue
        sid = item["id"]
        for z, ext in (item.get("bildExt") or {}).items():
            ext_lines.append(f"  '{sid}-{z}': '{ext}',")

    ext_block = "const SPIEL_BILD_EXT = {\n" + "\n".join(sorted(ext_lines)) + "\n};"
    text = re.sub(r"const SPIEL_BILD_EXT = \{[\s\S]*?\n\};", ext_block, text, count=1)

    pfad_lines = []
    for item in katalog:
        if item.get("typ") != "spiel":
            continue
        sid = item["id"]
        for z, path in (item.get("bildPfade") or {}).items():
            pfad_lines.append(f"  '{sid}-{z}': '{path}',")
    pfad_block = "const SPIEL_BILD_PFAD = {\n" + "\n".join(sorted(pfad_lines)) + "\n};"
    if "const SPIEL_BILD_PFAD" in text:
        text = re.sub(r"const SPIEL_BILD_PFAD = \{[\s\S]*?\n\};", pfad_block, text, count=1)
    else:
        text = text.replace(ext_block, ext_block + "\n\n" + pfad_block, 1)

    if "function spielBildRelPath" not in text:
        helper = (
            "function spielBildRelPath(spiel, zKey, code, ext) {\n"
            "  const key = spiel + '-' + zKey;\n"
            "  if (SPIEL_BILD_PFAD[key]) return SPIEL_BILD_PFAD[key];\n"
            "  return 'assets/products/Games/' + code + '_' + zKey.toUpperCase() + '.' + ext;\n"
            "}\n\n"
        )
        text = text.replace("function spielBildPfadLager(spiel, zKey) {", helper + "function spielBildPfadLager(spiel, zKey) {")
    text = re.sub(
        r"return 'assets/products/Games/' \+ code \+ '_' \+ zKey\.toUpperCase\(\) \+ '\.' \+ ext;",
        "return spielBildRelPath(spiel, zKey, code, ext);",
        text,
        count=1,
    )

    konsolen_lines = []
    for item in katalog:
        if item.get("typ") == "konsolen":
            konsolen_lines.append(f"  '{item['id']}': '{item['bild']}',")

    # rebuild PRODUKT_BILDER konsolen entries only – keep function-based spiel entries
    start = text.index("const PRODUKT_BILDER = {")
    end = text.index("\n};", start)
    block = text[start:end]
    for line in konsolen_lines:
        pid = line.split("'")[1]
        path_val = line.split("'")[3]
        if f"'{pid}':" in block:
            block = re.sub(rf"  '{re.escape(pid)}': '[^']*',", line, block, count=1)
        else:
            block = block.rstrip() + "\n" + line
    text = text[:start] + block + text[end:]

    lager_path.write_text(text, encoding="utf-8")


def main():
    katalog = sync_katalog()
    rebuild_sheet_rows(katalog)
    patch_lager_js(katalog)
    print("synced katalog, lager-api, lager.js")


if __name__ == "__main__":
    main()
