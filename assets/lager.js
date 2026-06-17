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
  'gba-charmander': 'Game Boy Advance Charmander Edition',
  'spiel-sm1-z1': 'Super Mario Land – Akzeptabel',
  'spiel-sm1-z2': 'Super Mario Land – Gut',
  'spiel-sm1-z3': 'Super Mario Land – Sehr gut',
  'spiel-sm1-z4': 'Super Mario Land – Neuwertig',
  'spiel-sm2-z1': 'Super Mario Land 2 – Akzeptabel',
  'spiel-sm2-z2': 'Super Mario Land 2 – Gut',
  'spiel-sm2-z3': 'Super Mario Land 2 – Sehr gut',
  'spiel-sm2-z4': 'Super Mario Land 2 – Neuwertig',
  'spiel-sm3-z1': 'Super Mario Land 3 – Akzeptabel',
  'spiel-sm3-z2': 'Super Mario Land 3 – Gut',
  'spiel-sm3-z3': 'Super Mario Land 3 – Sehr gut',
  'spiel-sm3-z4': 'Super Mario Land 3 – Neuwertig'
};

const SPIEL_BILD_EXT = { 'sm2-z1': 'jpeg' };

function spielBildPfadLager(spiel, zKey) {
  const num = spiel.replace('sm', '');
  const ext = SPIEL_BILD_EXT[spiel + '-' + zKey] || 'webp';
  return 'assets/products/SM' + num + '_' + zKey.toUpperCase() + '.' + ext;
}

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
  'gba-charmander': 'assets/products/gba-charmander-float.png',
  'spiel-sm1-z1': spielBildPfadLager('sm1', 'z1'),
  'spiel-sm1-z2': spielBildPfadLager('sm1', 'z2'),
  'spiel-sm1-z3': spielBildPfadLager('sm1', 'z3'),
  'spiel-sm1-z4': spielBildPfadLager('sm1', 'z4'),
  'spiel-sm2-z1': spielBildPfadLager('sm2', 'z1'),
  'spiel-sm2-z2': spielBildPfadLager('sm2', 'z2'),
  'spiel-sm2-z3': spielBildPfadLager('sm2', 'z3'),
  'spiel-sm2-z4': spielBildPfadLager('sm2', 'z4'),
  'spiel-sm3-z1': spielBildPfadLager('sm3', 'z1'),
  'spiel-sm3-z2': spielBildPfadLager('sm3', 'z2'),
  'spiel-sm3-z3': spielBildPfadLager('sm3', 'z3'),
  'spiel-sm3-z4': spielBildPfadLager('sm3', 'z4')
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
