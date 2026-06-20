"""Replace hardcoded product HTML with empty grid in shop.html."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
shop = ROOT / "shop.html"
text = shop.read_text(encoding="utf-8")
start = text.index('<div class="produkte">')
end = text.index('<p class="keine-treffer"')
replacement = (
    '<div class="produkte" id="produkte-grid">\n\n'
)
text = text[:start] + replacement + text[end:]
shop.write_text(text, encoding="utf-8")
print("Removed hardcoded products from shop.html")
