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
  'spiel-sm3-z4': 'Super Mario Land 3 – Neuwertig',
  'spiel-pb-z1': 'Pokémon Blau – Akzeptabel',
  'spiel-pb-z2': 'Pokémon Blau – Gut',
  'spiel-pb-z3': 'Pokémon Blau – Sehr gut',
  'spiel-pb-z4': 'Pokémon Blau – Neuwertig',
  'spiel-pr-z1': 'Pokémon Rot – Akzeptabel',
  'spiel-pr-z2': 'Pokémon Rot – Gut',
  'spiel-pr-z3': 'Pokémon Rot – Sehr gut',
  'spiel-pr-z4': 'Pokémon Rot – Neuwertig',
  'spiel-pg-z1': 'Pokémon Gelb – Akzeptabel',
  'spiel-pg-z2': 'Pokémon Gelb – Gut',
  'spiel-pg-z3': 'Pokémon Gelb – Sehr gut',
  'spiel-pg-z4': 'Pokémon Gelb – Neuwertig',
  'spiel-pk-z1': 'Pokémon Kristall – Akzeptabel',
  'spiel-pk-z2': 'Pokémon Kristall – Gut',
  'spiel-pk-z3': 'Pokémon Kristall – Sehr gut',
  'spiel-pk-z4': 'Pokémon Kristall – Neuwertig',
  'spiel-pt-z1': 'Pokémon Trading Card – Akzeptabel',
  'spiel-pt-z2': 'Pokémon Trading Card – Gut',
  'spiel-pt-z3': 'Pokémon Trading Card – Sehr gut',
  'spiel-pt-z4': 'Pokémon Trading Card – Neuwertig',
  'spiel-dbz-z1': 'Dragon Ball Z – Akzeptabel',
  'spiel-dbz-z2': 'Dragon Ball Z – Gut',
  'spiel-dbz-z3': 'Dragon Ball Z – Sehr gut',
  'spiel-dbz-z4': 'Dragon Ball Z – Neuwertig',
  'spiel-zla-z1': 'Zelda: Link\'s Awakening – Akzeptabel',
  'spiel-zla-z2': 'Zelda: Link\'s Awakening – Gut',
  'spiel-zla-z3': 'Zelda: Link\'s Awakening – Sehr gut',
  'spiel-zla-z4': 'Zelda: Link\'s Awakening – Neuwertig',
  'spiel-t-z1': 'Tetris – Akzeptabel',
  'spiel-t-z2': 'Tetris – Gut',
  'spiel-t-z3': 'Tetris – Sehr gut',
  'spiel-t-z4': 'Tetris – Neuwertig'
};

const SPIEL_BILD_CODE = {
  sm1: 'SM1', sm2: 'SM2', sm3: 'SM3',
  pb: 'PB', pr: 'PR', pg: 'PG', pk: 'PK', pt: 'PT',
  dbz: 'DBZ', zla: 'ZLA', t: 'T'
};

const SPIEL_BILD_EXT = {
  'sm2-z1': 'jpeg',
  'pb-z2': 'jpeg', 'pb-z4': 'jpeg',
  'pr-z1': 'jpg', 'pr-z3': 'jpeg',
  'pg-z4': 'jpeg',
  'pk-z3': 'jpeg',
  'pt-z3': 'jpeg',
  'dbz-z3': 'jpeg',
  'zla-z2': 'jpeg', 'zla-z3': 'jpg',
  't-z2': 'jpeg', 't-z3': 'jpeg'
};

function spielBildPfadLager(spiel, zKey) {
  const code = SPIEL_BILD_CODE[spiel] || spiel.toUpperCase();
  const ext = SPIEL_BILD_EXT[spiel + '-' + zKey] || 'webp';
  return 'assets/products/' + code + '_' + zKey.toUpperCase() + '.' + ext;
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
  'spiel-sm3-z4': spielBildPfadLager('sm3', 'z4'),
  'spiel-pb-z1': spielBildPfadLager('pb', 'z1'),
  'spiel-pb-z2': spielBildPfadLager('pb', 'z2'),
  'spiel-pb-z3': spielBildPfadLager('pb', 'z3'),
  'spiel-pb-z4': spielBildPfadLager('pb', 'z4'),
  'spiel-pr-z1': spielBildPfadLager('pr', 'z1'),
  'spiel-pr-z2': spielBildPfadLager('pr', 'z2'),
  'spiel-pr-z3': spielBildPfadLager('pr', 'z3'),
  'spiel-pr-z4': spielBildPfadLager('pr', 'z4'),
  'spiel-pg-z1': spielBildPfadLager('pg', 'z1'),
  'spiel-pg-z2': spielBildPfadLager('pg', 'z2'),
  'spiel-pg-z3': spielBildPfadLager('pg', 'z3'),
  'spiel-pg-z4': spielBildPfadLager('pg', 'z4'),
  'spiel-pk-z1': spielBildPfadLager('pk', 'z1'),
  'spiel-pk-z2': spielBildPfadLager('pk', 'z2'),
  'spiel-pk-z3': spielBildPfadLager('pk', 'z3'),
  'spiel-pk-z4': spielBildPfadLager('pk', 'z4'),
  'spiel-pt-z1': spielBildPfadLager('pt', 'z1'),
  'spiel-pt-z2': spielBildPfadLager('pt', 'z2'),
  'spiel-pt-z3': spielBildPfadLager('pt', 'z3'),
  'spiel-pt-z4': spielBildPfadLager('pt', 'z4'),
  'spiel-dbz-z1': spielBildPfadLager('dbz', 'z1'),
  'spiel-dbz-z2': spielBildPfadLager('dbz', 'z2'),
  'spiel-dbz-z3': spielBildPfadLager('dbz', 'z3'),
  'spiel-dbz-z4': spielBildPfadLager('dbz', 'z4'),
  'spiel-zla-z1': spielBildPfadLager('zla', 'z1'),
  'spiel-zla-z2': spielBildPfadLager('zla', 'z2'),
  'spiel-zla-z3': spielBildPfadLager('zla', 'z3'),
  'spiel-zla-z4': spielBildPfadLager('zla', 'z4'),
  'spiel-t-z1': spielBildPfadLager('t', 'z1'),
  'spiel-t-z2': spielBildPfadLager('t', 'z2'),
  'spiel-t-z3': spielBildPfadLager('t', 'z3'),
  'spiel-t-z4': spielBildPfadLager('t', 'z4')
};

const VERKAUFE_DEFAULT = [
  { produktId: 'classic', datum: '2026-06-13' }
];

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
