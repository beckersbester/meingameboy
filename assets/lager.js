const LAGER_API_URL = typeof SITE_API_URL !== 'undefined' ? SITE_API_URL : '';

const PRODUKT_NAMEN = {
  'color-wario': 'Game Boy Color Wario Edition',
  'classic': 'Nintendo Game Boy Classic',
  'pocket-orange': 'Game Boy Pocket Orange',
  'pocket-squirtle': 'Game Boy Pocket Pokémon Squirtle Edition',
  'pocket-charizard': 'Game Boy Pocket Pokémon Charizard Edition',
  'pocket-pikachu': 'Game Boy Pocket Pikachu Edition',
  'pocket-classic': 'Game Boy Pocket Classic Design',
  'color-mario': 'Game Boy Color Mario Edition',
  'classic-black-ips': 'Game Boy Classic Black Button IPS V5',
  'classic-red': 'Game Boy Classic Red Button',
  'pocket-transparent': 'Game Boy Pocket Transparent',
  'color-pokemon': 'Game Boy Color Pokémon',
  'color-charizard-orange': 'Game Boy Color Charizard Orange Edition',
  'color-yellow': 'Game Boy Color Pokémon Yellow Edition',
  'classic-grau-ips': 'Game Boy Classic Grau IPS V5',
  'gba-gengar': 'Game Boy Advance Gengar Edition',
  'gba-charmander': 'Game Boy Advance Charmander Edition'
};

const PRODUKT_BILDER = {
  'color-wario': 'WhatsApp Image 2026-06-07 at 20.16.09.png',
  'classic': 'WhatsApp Image 2026-05-21 at 18.26.14 (5).png',
  'pocket-orange': 'WhatsApp Image 2026-06-07 at 20.16.13 (9).png',
  'pocket-squirtle': 'WhatsApp Image 2026-06-07 at 20.16.13 (5).png',
  'pocket-charizard': 'WhatsApp Image 2026-06-07 at 20.16.13 (3).png',
  'pocket-pikachu': 'WhatsApp Image 2026-06-07 at 20.16.13 (1).png',
  'pocket-classic': 'WhatsApp Image 2026-06-07 at 20.16.10.png',
  'color-mario': 'WhatsApp Image 2026-06-07 at 20.16.09 (2).png',
  'classic-black-ips': 'WhatsApp Image 2026-06-07 at 20.29.29.png',
  'classic-red': 'WhatsApp Image 2026-05-21 at 18.26.14 (3).png',
  'pocket-transparent': 'WhatsApp Image 2026-05-21 at 18.26.13 (14).png',
  'color-pokemon': 'WhatsApp Image 2026-05-21 at 18.26.13 (18).png',
  'color-charizard-orange': 'WhatsApp Image 2026-05-21 at 18.26.13 (16).png',
  'color-yellow': 'WhatsApp Image 2026-05-21 at 18.48.20.png',
  'classic-grau-ips': 'WhatsApp Image 2026-06-08 at 10.25.40.png',
  'gba-gengar': 'gba-gengar-edition.png',
  'gba-charmander': 'gba-charmander-edition.png'
};

const VERKAUFE_DEFAULT = [
  { produktId: 'classic', datum: '2026-06-13' }
];

function formatVerkaufsDatum(datum) {
  if (!datum) return '';
  const s = String(datum);
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[3] + '.' + iso[2] + '.' + iso[1];
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    return d + '.' + m + '.' + parsed.getFullYear();
  }
  return s;
}

function renderVerkaeufe(verkaeufe, maxAnzahl) {
  const box = document.getElementById('verkaeufe-box');
  const liste = document.getElementById('verkaeufe-liste');
  if (!box || !liste || !Array.isArray(verkaeufe) || verkaeufe.length === 0) return;

  liste.innerHTML = '';
  verkaeufe.slice(0, maxAnzahl || 20).forEach(function (verkauf) {
    const name = PRODUKT_NAMEN[verkauf.produktId] || verkauf.name || verkauf.produktId;
    const bild = verkauf.bild || PRODUKT_BILDER[verkauf.produktId] || '';
    const li = document.createElement('li');
    li.innerHTML =
      (bild ? '<img class="verkaeufe-bild" src="' + bild + '" alt="">' : '') +
      '<div class="verkaeufe-inhalt">' +
        '<span class="verkaeufe-name">' + name + '</span>' +
        '<span class="verkaeufe-datum">' + formatVerkaufsDatum(verkauf.datum) + '</span>' +
      '</div>';
    liste.appendChild(li);
  });
}

async function ladeVerkaeufeDaten() {
  if (LAGER_API_URL) {
    try {
      const response = await fetch(LAGER_API_URL + '?t=' + Date.now());
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.verkaeufe) && data.verkaeufe.length > 0) {
          return data.verkaeufe;
        }
      }
    } catch (error) {
      /* Fallback */
    }
  }

  try {
    const response = await fetch('verkaeufe.json?t=' + Date.now());
    if (response.ok) return await response.json();
  } catch (error) {
    /* Fallback */
  }

  return VERKAUFE_DEFAULT;
}

function initVerkaeufeSeite(maxAnzahl) {
  renderVerkaeufe(VERKAUFE_DEFAULT, maxAnzahl);
  ladeVerkaeufeDaten().then(function (verkaeufe) {
    renderVerkaeufe(verkaeufe, maxAnzahl);
  });
}
