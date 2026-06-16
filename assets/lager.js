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
  'color-wario': 'assets/products/color-wario-float.png',
  'classic': 'assets/products/classic-float.png',
  'pocket-orange': 'assets/products/pocket-orange-float.png',
  'pocket-squirtle': 'assets/products/pocket-squirtle-float.png',
  'pocket-charizard': 'assets/products/pocket-charizard-float.png',
  'pocket-pikachu': 'assets/products/pocket-pikachu-float.png',
  'pocket-classic': 'assets/products/pocket-classic-float.png',
  'color-mario': 'assets/products/color-mario-float.png',
  'classic-black-ips': 'assets/products/classic-black-ips-float.png',
  'classic-red': 'assets/products/classic-red-float.png',
  'pocket-transparent': 'assets/products/pocket-transparent-float.png',
  'color-pokemon': 'assets/products/color-pokemon-float.png',
  'color-charizard-orange': 'assets/products/color-charizard-orange-float.png',
  'color-yellow': 'assets/products/color-yellow-float.png',
  'classic-grau-ips': 'assets/products/classic-grau-ips-float.png',
  'gba-gengar': 'assets/products/gba-gengar-float.png',
  'gba-charmander': 'assets/products/gba-charmander-float.png'
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
