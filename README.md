# meingameboy.de

Statische Website für GitHub Pages (`CNAME` → meingameboy.de).

## Struktur

- HTML-Seiten im Root (`index.html`, `shop.html`, …)
- `assets/` – CSS, JS, Logo, Produktbilder
- `assets/products/Gameboy/` – Konsolen-Fotos
- `assets/products/Games/` – Spiel-Module
- `assets/products/float/` – Kategorie-Bilder Startseite
- `bestand.json`, `verkaeufe.json` – Fallback-Daten für Shop/Verkäufe
- `katalog.json` – Katalog-Quelle (eingebettet in `shop.html`)
- `google-apps-script/lager-api.gs` – Backend (separat in Google deployen)
