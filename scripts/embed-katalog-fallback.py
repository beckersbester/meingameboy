"""Embed katalog.json into shop.html as KATALOG_FALLBACK."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
shop_path = ROOT / "shop.html"
katalog = json.loads((ROOT / "katalog.json").read_text(encoding="utf-8"))
fallback = "const KATALOG_FALLBACK = " + json.dumps(katalog, ensure_ascii=False, indent=2) + ";\n\n"
text = shop_path.read_text(encoding="utf-8")
marker = "const LAGER_API_URL = typeof SITE_API_URL !== 'undefined' ? SITE_API_URL : '';\n\n"
if "const KATALOG_FALLBACK" in text:
    start = text.index("const KATALOG_FALLBACK")
    end = text.index("\n\nconst kategorieTitel")
    text = text[:start] + fallback + text[end + 2:]
else:
    text = text.replace(marker, marker + fallback, 1)

old_bootstrap = """async function loadShopKatalogFromJson() {
  try {
    const response = await fetch('katalog.json?t=' + Date.now());
    if (response.ok) return await response.json();
  } catch (error) { /* fallback */ }
  return [];
}

async function bootstrapShop() {
  const apiPromise = typeof window.fetchShopApiData === 'function'
    ? window.fetchShopApiData()
    : Promise.resolve(null);

  const katalog = await loadShopKatalogFromJson();
"""

new_bootstrap = """function getShopKatalog() {
  if (typeof KATALOG_FALLBACK !== 'undefined' && KATALOG_FALLBACK.length) {
    return KATALOG_FALLBACK;
  }
  return [];
}

async function bootstrapShop() {
  const apiPromise = typeof window.fetchShopApiData === 'function'
    ? window.fetchShopApiData()
    : Promise.resolve(null);

  const katalog = getShopKatalog();
"""

if old_bootstrap in text:
    text = text.replace(old_bootstrap, new_bootstrap, 1)
else:
    print("WARN: bootstrap block not found, patch manually")

shop_path.write_text(text, encoding="utf-8")
print("Embedded KATALOG_FALLBACK into shop.html")
