/**
 * Restore Gaming – Lager, Warenkorb-Checkout, Rabattcodes, PayPal IPN
 *
 * Tabs im Google Sheet: Bestand, Preise, Katalog, Rabattcodes, Verkaeufe, Verarbeitet, Verdaechtig, Kontakt
 * setupLagerSheet einmal ausführen nach Update (legt Tab „Katalog“ an).
 */

const SPREADSHEET_ID = '14KYd7DKgw6rUoM7CxylOSBxcfK4zt-3qXy5j0ZleJ-E';
const PAYPAL_VERIFY_URL = 'https://ipnpb.paypal.com/cgi-bin/webscr';
const PAYPAL_BUSINESS = 'restore.info@gmx.de';
const PAYPAL_RETURN_URL = 'https://meingameboy.de/shop.html?kauf=erfolg';
const PAYPAL_CANCEL_URL = 'https://meingameboy.de/shop.html';
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyNYtUSgXDSb-jhofgXPWr_xrTCR4MaL5I01qrCTnmNQRb85EfRDTVnnEfSeTCdVLvl/exec';
const ZEITZONE = 'Europe/Berlin';
const KONTAKT_EMAIL = 'restore.mail@gmx.de';
const PREIS_TOLERANZ = 0.02;

const BESTAND_START = {
  'color-wario': 1,
  'classic': 1,
  'pocket-orange': 0,
  'pocket-squirtle': 2,
  'pocket-charizard': 1,
  'pocket-pikachu': 2,
  'pocket-classic': 2,
  'color-mario': 1,
  'classic-black-ips': 1,
  'classic-red': 1,
  'pocket-transparent': 1,
  'color-pokemon': 1,
  'color-charizard-orange': 0,
  'color-yellow': 3,
  'classic-grau-ips': 1,
  'gba-gengar': 0,
  'gba-charmander': 0,
  'gbasp-pokemon-g': 1,
  'gbasp-pokemon-k': 1,
  'gbasp-pokemon-r': 1,
  'gbasp-blau': 1,
  'gbasp-schwarz': 0,
  'gbasp-silber': 1,
  'gbasp-mario': 1,
  'spiel-sm1-z1': 1,
  'spiel-sm1-z2': 1,
  'spiel-sm1-z3': 1,
  'spiel-sm1-z4': 0,
  'spiel-sm2-z1': 1,
  'spiel-sm2-z2': 0,
  'spiel-sm2-z3': 0,
  'spiel-sm2-z4': 1,
  'spiel-sm3-z1': 1,
  'spiel-sm3-z2': 1,
  'spiel-sm3-z3': 1,
  'spiel-sm3-z4': 1,
  'spiel-pb-z1': 0,
  'spiel-pb-z2': 1,
  'spiel-pb-z3': 0,
  'spiel-pb-z4': 1,
  'spiel-pr-z1': 2,
  'spiel-pr-z2': 0,
  'spiel-pr-z3': 0,
  'spiel-pr-z4': 0,
  'spiel-pg-z1': 0,
  'spiel-pg-z2': 0,
  'spiel-pg-z3': 0,
  'spiel-pg-z4': 0,
  'spiel-pk-z1': 0,
  'spiel-pk-z2': 0,
  'spiel-pk-z3': 0,
  'spiel-pk-z4': 0,
  'spiel-pt-z1': 0,
  'spiel-pt-z2': 0,
  'spiel-pt-z3': 1,
  'spiel-pt-z4': 0,
  'spiel-dbz-z1': 0,
  'spiel-dbz-z2': 0,
  'spiel-dbz-z3': 1,
  'spiel-dbz-z4': 0,
  'spiel-zla-z1': 0,
  'spiel-zla-z2': 1,
  'spiel-zla-z3': 0,
  'spiel-zla-z4': 0,
  'spiel-t-z1': 0,
  'spiel-t-z2': 1,
  'spiel-t-z3': 0,
  'spiel-t-z4': 0
};

const PREISE_START = {
  'color-wario': 124.99,
  'classic': 109.99,
  'pocket-orange': 114.99,
  'pocket-squirtle': 119.99,
  'pocket-charizard': 119.99,
  'pocket-pikachu': 119.99,
  'pocket-classic': 114.99,
  'color-mario': 114.99,
  'classic-black-ips': 159.99,
  'classic-red': 109.99,
  'pocket-transparent': 99.99,
  'color-pokemon': 114.99,
  'color-charizard-orange': 119.99,
  'color-yellow': 119.99,
  'classic-grau-ips': 159.99,
  'gba-gengar': 129.99,
  'gba-charmander': 129.99,
  'gbasp-pokemon-g': 144.99,
  'gbasp-pokemon-k': 144.99,
  'gbasp-pokemon-r': 144.99,
  'gbasp-blau': 129.99,
  'gbasp-schwarz': 129.99,
  'gbasp-silber': 129.99,
  'gbasp-mario': 129.99,
  'spiel-sm1-z1': 14.99,
  'spiel-sm1-z2': 19.99,
  'spiel-sm1-z3': 24.99,
  'spiel-sm1-z4': 49.99,
  'spiel-sm2-z1': 14.99,
  'spiel-sm2-z2': 19.99,
  'spiel-sm2-z3': 24.99,
  'spiel-sm2-z4': 49.99,
  'spiel-sm3-z1': 16.99,
  'spiel-sm3-z2': 21.99,
  'spiel-sm3-z3': 26.99,
  'spiel-sm3-z4': 59.99,
  'spiel-pb-z1': 34.99,
  'spiel-pb-z2': 39.99,
  'spiel-pb-z3': 49.99,
  'spiel-pb-z4': 89.99,
  'spiel-pr-z1': 34.99,
  'spiel-pr-z2': 39.99,
  'spiel-pr-z3': 49.99,
  'spiel-pr-z4': 89.99,
  'spiel-pg-z1': 34.99,
  'spiel-pg-z2': 39.99,
  'spiel-pg-z3': 49.99,
  'spiel-pg-z4': 89.99,
  'spiel-pk-z1': 89.99,
  'spiel-pk-z2': 99.99,
  'spiel-pk-z3': 114.99,
  'spiel-pk-z4': 169.99,
  'spiel-pt-z1': 12.99,
  'spiel-pt-z2': 15.99,
  'spiel-pt-z3': 18.99,
  'spiel-pt-z4': 29.99,
  'spiel-dbz-z1': 12.99,
  'spiel-dbz-z2': 15.99,
  'spiel-dbz-z3': 18.99,
  'spiel-dbz-z4': 29.99,
  'spiel-zla-z1': 33.99,
  'spiel-zla-z2': 38.99,
  'spiel-zla-z3': 48.99,
  'spiel-zla-z4': 68.99,
  'spiel-t-z1': 12.99,
  'spiel-t-z2': 15.99,
  'spiel-t-z3': 19.99,
  'spiel-t-z4': 29.99
};

const PRODUKT_NAMEN = {
  'color-wario': 'Game Boy Color Wario Edition',
  'classic': 'Nintendo Game Boy Classic',
  'pocket-orange': 'Game Boy Pocket Orange',
  'pocket-squirtle': 'Game Boy Pocket Pokémon Schiggy Edition',
  'pocket-charizard': 'Game Boy Pocket Pokémon Glurak Edition',
  'pocket-pikachu': 'Game Boy Pocket Pikachu Edition',
  'pocket-classic': 'Game Boy Pocket Classic Design',
  'color-mario': 'Game Boy Color Mario Edition',
  'classic-black-ips': 'Game Boy Classic Black Button IPS V5',
  'classic-red': 'Game Boy Classic Red Button',
  'pocket-transparent': 'Game Boy Pocket Transparent',
  'color-pokemon': 'Game Boy Color Pokémon',
  'color-charizard-orange': 'Game Boy Color Charizard Red Edition',
  'color-yellow': 'Game Boy Color Pokémon Yellow Edition',
  'classic-grau-ips': 'Game Boy Classic Grau IPS V5',
  'gba-gengar': 'Game Boy Advance Gengar Edition',
  'gba-charmander': 'Game Boy Advance Glumanda Edition',
  'gbasp-pokemon-g': 'Game Boy Advance SP Pokémon Groudon Edition',
  'gbasp-pokemon-k': 'Game Boy Advance SP Pokémon Kyogre Edition',
  'gbasp-pokemon-r': 'Game Boy Advance SP Pokémon Rayquaza Edition',
  'gbasp-blau': 'Game Boy Advance SP Blau',
  'gbasp-schwarz': 'Game Boy Advance SP Schwarz',
  'gbasp-silber': 'Game Boy Advance SP Silber',
  'gbasp-mario': 'Game Boy Advance SP Mario Edition',
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

const KATALOG_HEADERS = [
  'reihenfolge', 'typ', 'id', 'titel', 'bild', 'klassen', 'badge',
  'features', 'startZustand', 'bildCode', 'bildExt', 'aktiv'
];

const KATALOG_START_ROWS = [
  [1, "konsolen", "color-wario", "Game Boy Color Wario Edition", "assets/products/color-wario-float.png", "konsolen color", "", "Wario Edition – gelbes Retro-Design|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [2, "konsolen", "classic", "Nintendo Game Boy Classic", "assets/products/classic-float.png", "konsolen classic", "", "Der klassische DMG-Look|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [3, "konsolen", "pocket-orange", "Game Boy Pocket Orange", "assets/products/pocket-orange-float.png", "konsolen pocket", "", "Knalliges Orange – fällt auf|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [4, "konsolen", "pocket-squirtle", "Game Boy Pocket Pokémon Schiggy Edition", "assets/products/pocket-squirtle-float.png", "konsolen pocket", "", "Pokémon Schiggy Edition – transparent blau|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [5, "konsolen", "pocket-charizard", "Game Boy Pocket Pokémon Glurak Edition", "assets/products/pocket-charizard-float.png", "konsolen pocket", "", "Pokémon Glurak Edition – transparenter Look|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [6, "konsolen", "pocket-pikachu", "Game Boy Pocket Pikachu Edition", "assets/products/pocket-pikachu-float.png", "konsolen pocket", "", "Pikachu Edition – ikonisches Gelb|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [7, "konsolen", "pocket-classic", "Game Boy Pocket Classic Design", "assets/products/pocket-classic-float.png", "konsolen pocket", "", "Pocket im Classic-Design|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [8, "konsolen", "color-mario", "Game Boy Color Mario Edition", "assets/products/color-mario-float.png", "konsolen color", "", "Offizielle Mario-Scheibe|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [9, "konsolen", "classic-black-ips", "Game Boy Classic Black Button IPS V5", "assets/products/classic-black-ips-float.png", "konsolen classic ips", "", "IPS V5 Display – hell, scharf & farbecht|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [10, "konsolen", "classic-red", "Game Boy Classic Red Button", "assets/products/classic-red-float.png", "konsolen classic", "", "Weißes Gehäuse · rote Tasten|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [11, "konsolen", "pocket-transparent", "Game Boy Pocket Transparent", "assets/products/pocket-transparent-float.png", "konsolen pocket", "", "Transparent – Innere Technik sichtbar|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [12, "konsolen", "color-pokemon", "Game Boy Color Pokémon", "assets/products/color-pokemon-float.png", "konsolen color", "", "Pokémon-Scheibe · weißes Gehäuse|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [13, "konsolen", "color-charizard-orange", "Game Boy Color Charizard Red Edition", "assets/products/color-charizard-orange-float.png", "konsolen color", "", "Charizard Red Edition – Pokémon Design|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [14, "konsolen", "color-yellow", "Game Boy Color Pokémon Yellow Edition", "assets/products/color-yellow-float.png", "konsolen color", "", "Pokémon Yellow Edition|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [15, "konsolen", "classic-grau-ips", "Game Boy Classic Grau IPS V5", "assets/products/classic-grau-ips-float.png", "konsolen classic ips", "", "IPS V5 Display – hell, scharf & farbecht|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [16, "konsolen", "gba-gengar", "Game Boy Advance Gengar Edition", "assets/products/gba-gengar-float.png", "konsolen gba", "", "Custom Gengar Design – transluzent|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [17, "konsolen", "gba-charmander", "Game Boy Advance Glumanda Edition", "assets/products/gba-charmander-float.png", "konsolen gba", "", "Custom Glumanda Design – transluzent orange|Neues Austauschgehäuse & frische Display-Scheibe|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [18, "konsolen", "gbasp-pokemon-g", "Game Boy Advance SP Pokémon Groudon Edition", "assets/products/GBASP_G_float.png", "konsolen gbasp", "", "Frisches Groudon-Austauschgehäuse – top Zustand|AGS-001 Original-Display|USB-Ladekabel inklusive|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [19, "konsolen", "gbasp-pokemon-k", "Game Boy Advance SP Pokémon Kyogre Edition", "assets/products/GBASP_K_float.png", "konsolen gbasp", "", "Frisches Kyogre-Austauschgehäuse – top Zustand|AGS-001 Original-Display|USB-Ladekabel inklusive|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [20, "konsolen", "gbasp-pokemon-r", "Game Boy Advance SP Pokémon Rayquaza Edition", "assets/products/GBASP_R_float.png", "konsolen gbasp", "", "Frisches Rayquaza-Austauschgehäuse – top Zustand|AGS-001 Original-Display|USB-Ladekabel inklusive|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [21, "konsolen", "gbasp-blau", "Game Boy Advance SP Blau", "assets/products/GBASP_blau_float.png", "konsolen gbasp", "", "Original Nintendo-Gehäuse · guter Gebrauchtzustand|AGS-001 Original-Display|USB-Ladekabel inklusive|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [22, "konsolen", "gbasp-schwarz", "Game Boy Advance SP Schwarz", "assets/products/GBASP_black_float.png", "konsolen gbasp", "", "Original Nintendo-Gehäuse · guter Gebrauchtzustand|AGS-001 Original-Display|USB-Ladekabel inklusive|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [23, "konsolen", "gbasp-silber", "Game Boy Advance SP Silber", "assets/products/GBASP_silber_float.png", "konsolen gbasp", "", "Original Nintendo-Gehäuse · guter Gebrauchtzustand|AGS-001 Original-Display|USB-Ladekabel inklusive|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [24, "konsolen", "gbasp-mario", "Game Boy Advance SP Mario Edition", "assets/products/GBASP_mario_float.png", "konsolen gbasp", "", "Original Nintendo-Gehäuse · guter Gebrauchtzustand|AGS-001 Original-Display|USB-Ladekabel inklusive|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "", "", "", "ja"],
  [25, "spiel", "sm1", "Super Mario Land", "assets/products/SM1_Z3.webp", "spiele spiel-variante", "Mario", "Original Game Boy Modul|Wartungsfrei – keine Speicherbatterie nötig|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "z3", "SM1", "", "ja"],
  [26, "spiel", "sm2", "Super Mario Land 2", "assets/products/SM2_Z3.webp", "spiele spiel-variante", "Mario", "Original Game Boy Modul|Speichert (neue Batterie)|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "z3", "SM2", "z1:jpeg", "ja"],
  [27, "spiel", "sm3", "Super Mario Land 3", "assets/products/SM3_Z3.webp", "spiele spiel-variante", "Mario", "Original Game Boy Modul|Speichert (neue Batterie)|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "z3", "SM3", "", "ja"],
  [28, "spiel", "pb", "Pokémon Blau", "assets/products/PB_Z2.jpeg", "spiele spiel-variante", "Pokémon", "Original Game Boy Modul|Speichert (neue Batterie)|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "z2", "PB", "z2:jpeg|z4:jpeg", "ja"],
  [29, "spiel", "pr", "Pokémon Rot", "assets/products/PR_Z1.jpg", "spiele spiel-variante", "Pokémon", "Original Game Boy Modul|Speichert (neue Batterie)|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "z1", "PR", "z1:jpg|z3:jpeg", "ja"],
  [30, "spiel", "pg", "Pokémon Gelb", "assets/products/PG_Z4.jpeg", "spiele spiel-variante", "Pokémon", "Original Game Boy Modul|Speichert (neue Batterie)|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "z4", "PG", "z4:jpeg", "ja"],
  [31, "spiel", "pk", "Pokémon Kristall", "assets/products/PK_Z3.jpeg", "spiele spiel-variante", "Pokémon", "Original Game Boy Modul|Speichert (neue Batterie)|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "z3", "PK", "z3:jpeg", "ja"],
  [32, "spiel", "pt", "Pokémon Trading Card", "assets/products/PT_Z3.jpeg", "spiele spiel-variante", "Pokémon", "Original Game Boy Modul|Speichert (neue Batterie)|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "z3", "PT", "z3:jpeg", "ja"],
  [33, "spiel", "dbz", "Dragon Ball Z", "assets/products/DBZ_Z3.jpeg", "spiele spiel-variante", "Klassiker", "Original Game Boy Modul|Speichert (neue Batterie)|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "z3", "DBZ", "z3:jpeg", "ja"],
  [34, "spiel", "zla", "Zelda: Link's Awakening", "assets/products/ZLA_Z2.jpeg", "spiele spiel-variante", "Zelda", "Original Game Boy Modul|Speichert (neue Batterie)|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "z2", "ZLA", "z2:jpeg|z3:jpg", "ja"],
  [35, "spiel", "t", "Tetris", "assets/products/T_Z2.jpeg", "spiele spiel-variante", "Klassiker", "Original Game Boy Modul|Wartungsfrei – keine Speicherbatterie nötig|Technisch geprüft · sofort spielbereit|Kostenloser Versand", "z2", "T", "z2:jpeg|z3:jpeg", "ja"]
];

const RABATT_START = [
  ['code', 'typ', 'wert', 'aktiv', 'notiz'],
  ['GAMEBOY5', 'prozent', 5, 'ja', 'Extra 5 % ab 2 Artikeln (zusätzlich zum Webshop-Preis)']
];

const WEB_RABATT_FAKTOR = 0.95;
const KOMBI_RABATT_PROZENT = 5;
const KOMBI_RABATT_CODE = 'GAMEBOY5';
const KOMBI_MIN_ARTIKEL = 2;

function getSpreadsheet_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf('HIER_') === 0) {
    throw new Error('SPREADSHEET_ID in lager-api.gs eintragen');
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function heuteIso_() {
  return Utilities.formatDate(new Date(), ZEITZONE, 'yyyy-MM-dd');
}

function round2_(n) {
  return Math.round(Number(n) * 100) / 100;
}

/** Sheet-Prozent: 5 oder 0,05 (Google-Tabellen %) → 5 */
function normalizeProzentWert_(wert) {
  const n = Number(wert);
  if (!isFinite(n) || n <= 0) return 0;
  if (n > 0 && n <= 1) return round2_(n * 100);
  return round2_(n);
}

function parseRabattWert_(typ, wert) {
  const t = String(typ || 'prozent').trim().toLowerCase();
  const n = Number(wert);
  if (!isFinite(n) || n <= 0) return 0;
  if (t === 'fest') return round2_(n);
  return normalizeProzentWert_(n);
}

function formatDatumZelle_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, ZEITZONE, 'yyyy-MM-dd');
  }
  const s = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, ZEITZONE, 'yyyy-MM-dd');
  }
  return s;
}

function setupLagerSheet() {
  const ss = getSpreadsheet_();

  let bestand = ss.getSheetByName('Bestand');
  if (!bestand) bestand = ss.insertSheet('Bestand');
  bestand.clearContents();
  bestand.getRange(1, 1, 1, 2).setValues([['produktId', 'bestand']]).setFontWeight('bold');
  const bestandRows = Object.keys(BESTAND_START).map(function (id) {
    return [id, BESTAND_START[id]];
  });
  bestand.getRange(2, 1, bestandRows.length, 2).setValues(bestandRows);

  let preise = ss.getSheetByName('Preise');
  if (!preise) preise = ss.insertSheet('Preise');
  preise.clearContents();
  preise.getRange(1, 1, 1, 3).setValues([['produktId', 'preis', 'name']]).setFontWeight('bold');
  const preisRows = Object.keys(PREISE_START).map(function (id) {
    return [id, PREISE_START[id], PRODUKT_NAMEN[id] || id];
  });
  preise.getRange(2, 1, preisRows.length, 3).setValues(preisRows);

  let katalog = ss.getSheetByName('Katalog');
  if (!katalog) katalog = ss.insertSheet('Katalog');
  katalog.clearContents();
  katalog.getRange(1, 1, 1, KATALOG_HEADERS.length).setValues([KATALOG_HEADERS]).setFontWeight('bold');
  katalog.getRange(2, 1, KATALOG_START_ROWS.length, KATALOG_HEADERS.length).setValues(KATALOG_START_ROWS);

  let rabatt = ss.getSheetByName('Rabattcodes');
  if (!rabatt) rabatt = ss.insertSheet('Rabattcodes');
  rabatt.clearContents();
  rabatt.getRange(1, 1, RABATT_START.length, RABATT_START[0].length).setValues(RABATT_START).setFontWeight('bold');

  let verkaeufe = ss.getSheetByName('Verkaeufe');
  if (!verkaeufe) verkaeufe = ss.insertSheet('Verkaeufe');
  verkaeufe.clearContents();
  verkaeufe.getRange(1, 1, 1, 2).setValues([['produktId', 'datum']]).setFontWeight('bold');
  verkaeufe.getRange(2, 1).setValue('classic');
  verkaeufe.getRange(2, 2).setValue('2026-06-13');

  let verarbeitet = ss.getSheetByName('Verarbeitet');
  if (!verarbeitet) verarbeitet = ss.insertSheet('Verarbeitet');
  verarbeitet.clearContents();
  verarbeitet.getRange(1, 1, 1, 2).setValues([['txn_id', 'zeit']]).setFontWeight('bold');

  let verdaechtig = ss.getSheetByName('Verdaechtig');
  if (!verdaechtig) verdaechtig = ss.insertSheet('Verdaechtig');
  if (verdaechtig.getLastRow() === 0) {
    verdaechtig.getRange(1, 1, 1, 5).setValues([['zeit', 'txn_id', 'grund', 'gezahlt', 'erwartet']]).setFontWeight('bold');
  }
}

function doGet(e) {
  try {
    const params = getRequestParams_(e);

    if (params.action === 'kontakt') {
      return handleKontakt_(params);
    }

    const data = {
      bestand: leseBestand_(),
      preise: lesePreise_(),
      katalog: leseKatalog_(),
      verkaeufe: leseVerkaeufe_(20)
    };
    return jsonResponse_(data);
  } catch (err) {
    return jsonResponse_({ error: String(err) });
  }
}

function doPost(e) {
  try {
    const params = getRequestParams_(e);

    if (!params || Object.keys(params).length === 0) {
      return textResponse_('NO DATA');
    }

    if (params.action === 'kontakt') {
      return handleKontakt_(params);
    }

    if (params.action === 'checkout') {
      return handleCheckout_(params);
    }

    if (params.action === 'quote') {
      return handleQuote_(params);
    }

    if (!paypalVerifiziert_(params)) {
      return textResponse_('INVALID');
    }

    return handlePaypalIpn_(params);
  } catch (err) {
    return textResponse_('ERROR');
  }
}

function parseCartJson_(params) {
  try {
    const cart = JSON.parse(params.cart || '[]');
    if (!Array.isArray(cart)) {
      throw new Error('Ungültiger Warenkorb.');
    }
    return cart;
  } catch (err) {
    throw new Error('Ungültiger Warenkorb.');
  }
}

function buildValidatedCart_(cart) {
  if (!cart.length) {
    throw new Error('Warenkorb ist leer.');
  }

  const preise = lesePreise_();
  const bestand = leseBestand_();
  const merged = {};

  cart.forEach(function (entry) {
    const produktId = String(entry.produktId || '').trim();
    const qty = Math.max(1, parseInt(entry.qty, 10) || 1);
    if (!produktId || !preise[produktId]) {
      throw new Error('Unbekannter Artikel: ' + produktId);
    }
    const verfuegbar = bestand[produktId] || 0;
    if (verfuegbar < qty) {
      throw new Error('Nur noch ' + verfuegbar + '× verfügbar: ' + (PRODUKT_NAMEN[produktId] || produktId));
    }
    merged[produktId] = (merged[produktId] || 0) + qty;
  });

  return Object.keys(merged).map(function (produktId) {
    return {
      produktId: produktId,
      name: PRODUKT_NAMEN[produktId] || produktId,
      qty: merged[produktId],
      unitPrice: round2_(preise[produktId])
    };
  });
}

function zaehleWarenkorbArtikel_(lines) {
  return lines.reduce(function (sum, line) {
    return sum + line.qty;
  }, 0);
}

function istSpielProdukt_(produktId) {
  return String(produktId || '').indexOf('spiel-') === 0;
}

function abrundenAuf99_(betrag) {
  const b = round2_(betrag);
  const euro = Math.floor(b);
  if (round2_(b - euro) >= 0.99) return round2_(euro + 0.99);
  if (euro < 1) return 0.99;
  return round2_(euro - 1 + 0.99);
}

function abrundenAuf9Cent_(betrag) {
  const maxCents = Math.floor(round2_(betrag) * 100 + 1e-9);
  for (let c = maxCents; c >= 9; c--) {
    if (c % 10 === 9) return round2_(c / 100);
  }
  return 0.09;
}

function rundeShopPreis_(betrag, produktId) {
  if (istSpielProdukt_(produktId)) return abrundenAuf9Cent_(betrag);
  return abrundenAuf99_(betrag);
}

function websiteEinzelpreis_(listenpreis, produktId) {
  return rundeShopPreis_(round2_(listenpreis * WEB_RABATT_FAKTOR), produktId);
}

function verteileKombiRabatt_(lines, websiteSubtotal, targetTotal) {
  if (websiteSubtotal <= 0) return lines;

  const factor = targetTotal / websiteSubtotal;
  let running = 0;
  const lastIndex = lines.length - 1;

  return lines.map(function (line, index) {
    const lineWeb = round2_(line.websiteUnitPrice * line.qty);
    let lineTotal;

    if (index === lastIndex) {
      lineTotal = round2_(targetTotal - running);
    } else {
      lineTotal = round2_(lineWeb * factor);
      running = round2_(running + lineTotal);
    }

    return {
      produktId: line.produktId,
      name: line.name,
      qty: line.qty,
      unitPrice: round2_(lineTotal / line.qty)
    };
  });
}

function formatEuro_(value) {
  return Number(value).toFixed(2).replace('.', ',') + ' €';
}

function buildRabattHinweis_(priced, rabattCode, artikelAnzahl) {
  const code = String(rabattCode || '').trim().toUpperCase();

  if (!code) return '';

  if (code === KOMBI_RABATT_CODE && !priced.kombiAktiv) {
    if (artikelAnzahl < KOMBI_MIN_ARTIKEL) {
      return 'CODE GAMEBOY5 gilt ab ' + KOMBI_MIN_ARTIKEL + ' Artikeln.';
    }
    return 'CODE GAMEBOY5 ist ungültig oder nicht aktiv.';
  }

  if (priced.kombiAktiv) {
    return 'CODE GAMEBOY5 – nochmal 5 % auf den Warenkorb (−' + formatEuro_(priced.discount) + ').';
  }

  return '';
}

function handleQuote_(params) {
  try {
    const cart = parseCartJson_(params);
    if (!cart.length) {
      return jsonResponse_({ ok: true, subtotal: 0, discount: 0, total: 0, rabattGueltig: null, rabattHinweis: '' });
    }

    const lines = buildValidatedCart_(cart);
    const rabattCode = String(params.rabatt || '').trim().toUpperCase();
    const priced = berechneWarenkorbPreise_(lines, rabattCode);
    const artikelAnzahl = zaehleWarenkorbArtikel_(lines);

    return jsonResponse_({
      ok: true,
      subtotal: priced.subtotal,
      discount: priced.discount,
      total: priced.total,
      rabattGueltig: rabattCode ? !!priced.kombiAktiv : null,
      rabattProzent: priced.rabattProzent,
      rabattTyp: priced.rabattTyp || '',
      rabattHinweis: buildRabattHinweis_(priced, rabattCode, artikelAnzahl)
    });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err.message || err) });
  }
}

function handleCheckout_(params) {
  try {
    const cart = parseCartJson_(params);
    const rabattCode = String(params.rabatt || '').trim().toUpperCase();
    const lines = buildValidatedCart_(cart);
    const priced = berechneWarenkorbPreise_(lines, rabattCode);
    const artikelAnzahl = zaehleWarenkorbArtikel_(lines);
    const paypalUrl = buildPayPalCartUrl_(priced.lines, priced.rabattCode);

    return jsonResponse_({
      ok: true,
      paypalUrl: paypalUrl,
      subtotal: priced.subtotal,
      discount: priced.discount,
      total: priced.total,
      rabattCode: priced.rabattCode || '',
      rabattProzent: priced.rabattProzent,
      rabattTyp: priced.rabattTyp || '',
      rabattHinweis: buildRabattHinweis_(priced, rabattCode, artikelAnzahl)
    });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err.message || err) });
  }
}

function berechneWarenkorbPreise_(lines, rabattCode) {
  const artikelAnzahl = zaehleWarenkorbArtikel_(lines);
  const code = String(rabattCode || '').trim().toUpperCase();
  const kombiAktiv = artikelAnzahl >= KOMBI_MIN_ARTIKEL && code === KOMBI_RABATT_CODE;

  let websiteSubtotal = 0;
  const baseLines = lines.map(function (line) {
    const listUnit = round2_(line.unitPrice);
    const webUnit = websiteEinzelpreis_(listUnit, line.produktId);
    websiteSubtotal = round2_(websiteSubtotal + webUnit * line.qty);
    return {
      produktId: line.produktId,
      name: line.name,
      qty: line.qty,
      websiteUnitPrice: webUnit,
      unitPrice: webUnit
    };
  });

  let kombiDiscount = 0;
  let total = websiteSubtotal;
  let pricedLines = baseLines;

  if (kombiAktiv) {
    kombiDiscount = round2_(websiteSubtotal * KOMBI_RABATT_PROZENT / 100);
    total = round2_(websiteSubtotal - kombiDiscount);
    pricedLines = verteileKombiRabatt_(baseLines, websiteSubtotal, total);
  }

  return {
    lines: pricedLines,
    subtotal: websiteSubtotal,
    websiteSubtotal: websiteSubtotal,
    discount: kombiDiscount,
    total: total,
    kombiAktiv: kombiAktiv,
    rabattCode: kombiAktiv ? KOMBI_RABATT_CODE : '',
    rabattProzent: kombiAktiv ? KOMBI_RABATT_PROZENT : null,
    rabattTyp: kombiAktiv ? 'prozent' : ''
  };
}

function buildPayPalCartUrl_(lines, rabattCode) {
  const parts = [
    'cmd=_cart',
    'upload=1',
    'business=' + encodeURIComponent(PAYPAL_BUSINESS),
    'currency_code=EUR',
    'charset=utf-8',
    'no_shipping=0',
    'return=' + encodeURIComponent(PAYPAL_RETURN_URL),
    'cancel_return=' + encodeURIComponent(PAYPAL_CANCEL_URL),
    'notify_url=' + encodeURIComponent(WEB_APP_URL),
    'custom=' + encodeURIComponent(rabattCode || '')
  ];

  lines.forEach(function (line, index) {
    const n = index + 1;
    parts.push('item_name_' + n + '=' + encodeURIComponent(line.name));
    parts.push('amount_' + n + '=' + encodeURIComponent(line.unitPrice.toFixed(2)));
    parts.push('quantity_' + n + '=' + encodeURIComponent(String(line.qty)));
    parts.push('item_number_' + n + '=' + encodeURIComponent(line.produktId));
  });

  return 'https://www.paypal.com/cgi-bin/webscr?' + parts.join('&');
}

function handlePaypalIpn_(params) {
  const status = params.payment_status || '';
  const txnId = params.txn_id || '';

  if (status !== 'Completed' || !txnId) {
    return textResponse_('IGNORED');
  }

  if (txnBereitsVerarbeitet_(txnId)) {
    return textResponse_('OK');
  }

  const receiver = String(params.receiver_email || params.business || '').toLowerCase();
  if (receiver && receiver !== PAYPAL_BUSINESS.toLowerCase()) {
    verdaechtigMerken_(txnId, 'Falscher Empfänger: ' + receiver, params.mc_gross, '');
    return textResponse_('REJECTED');
  }

  if (String(params.mc_currency || 'EUR').toUpperCase() !== 'EUR') {
    verdaechtigMerken_(txnId, 'Falsche Währung', params.mc_gross, '');
    return textResponse_('REJECTED');
  }

  const items = parseIpnItems_(params);
  if (items.length === 0) {
    return textResponse_('NO ITEM');
  }

  const validation = validiereIpnBetrag_(items, parseFloat(params.mc_gross));

  if (!validation.ok) {
    verdaechtigMerken_(txnId, validation.grund, params.mc_gross, validation.erwartet);
    return textResponse_('REJECTED');
  }

  items.forEach(function (item) {
    for (let i = 0; i < item.qty; i++) {
      verkaufEintragen_(item.produktId, heuteIso_());
      bestandVerringern_(item.produktId);
    }
  });

  txnMerken_(txnId);
  return textResponse_('OK');
}

function parseIpnItems_(params) {
  let num = parseInt(params.num_cart_items || '0', 10);
  if (!(num > 0)) {
    for (let i = 1; i <= 10; i++) {
      if (params['item_number' + i] || params['item_name' + i]) num = i;
    }
  }

  const items = [];

  if (num > 0) {
    for (let i = 1; i <= num; i++) {
      const produktId = String(params['item_number' + i] || '').trim();
      const qty = Math.max(1, parseInt(params['quantity' + i] || '1', 10));
      const amount = parseFloat(
        params['mc_gross_' + i] ||
        params['payment_gross_' + i] ||
        params['amount' + i] ||
        '0'
      );
      if (!produktId) continue;
      items.push({ produktId: produktId, qty: qty, lineTotal: round2_(amount) });
    }
    return items;
  }

  const produktId = String(params.item_number || params.item_number1 || '').trim();
  if (!produktId) return [];
  return [{
    produktId: produktId,
    qty: Math.max(1, parseInt(params.quantity || params.quantity1 || '1', 10)),
    lineTotal: round2_(parseFloat(params.mc_gross || params.mc_gross_1 || '0'))
  }];
}

function validiereIpnBetrag_(ipnItems, paidTotal) {
  const preise = lesePreise_();
  const lines = [];

  for (let index = 0; index < ipnItems.length; index++) {
    const item = ipnItems[index];
    if (!preise[item.produktId]) {
      return { ok: false, grund: 'Unbekannte produktId: ' + item.produktId, erwartet: '' };
    }
    lines.push({
      produktId: item.produktId,
      name: PRODUKT_NAMEN[item.produktId] || item.produktId,
      qty: item.qty,
      unitPrice: round2_(preise[item.produktId])
    });
  }

  const priced = berechneWarenkorbPreise_(lines, String(params.custom || '').trim().toUpperCase());
  const expectedLineTotal = round2_(priced.total);
  const paid = round2_(paidTotal);

  if (Math.abs(paid - expectedLineTotal) > PREIS_TOLERANZ) {
    return {
      ok: false,
      grund: 'Betrag stimmt nicht (Rabatt: ' + (priced.rabattCode || 'keiner') + ')',
      erwartet: String(expectedLineTotal)
    };
  }

  let lineSum = 0;
  for (let index = 0; index < ipnItems.length; index++) {
    const item = ipnItems[index];
    const line = priced.lines[index];
    if (!line || line.produktId !== item.produktId) {
      return { ok: false, grund: 'Position passt nicht: ' + item.produktId, erwartet: '' };
    }
    const expected = round2_(line.unitPrice * line.qty);
    lineSum = round2_(lineSum + item.lineTotal);
    if (Math.abs(item.lineTotal - expected) > PREIS_TOLERANZ) {
      return {
        ok: false,
        grund: 'Positionsbetrag falsch: ' + item.produktId,
        erwartet: String(expected)
      };
    }
  }

  if (Math.abs(lineSum - paid) > PREIS_TOLERANZ) {
    return { ok: false, grund: 'Summe der Positionen passt nicht', erwartet: String(expectedLineTotal) };
  }

  return { ok: true };
}

function lookupRabatt_(code) {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) return null;

  const sheet = getSpreadsheet_().getSheetByName('Rabattcodes');
  if (!sheet) return null;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    const rowCode = String(values[i][0] || '').trim().toUpperCase();
    const aktiv = String(values[i][3] || '').trim().toLowerCase();
    const typ = String(values[i][1] || 'prozent').trim().toLowerCase();
    if (rowCode !== normalized || aktiv === 'nein') continue;
    return {
      code: rowCode,
      typ: typ,
      wert: parseRabattWert_(typ, values[i][2])
    };
  }

  return null;
}

function parseKatalogBildExt_(value) {
  const ext = {};
  String(value || '').split('|').forEach(function (part) {
    const pair = part.split(':');
    if (pair.length !== 2) return;
    const key = String(pair[0] || '').trim();
    const val = String(pair[1] || '').trim();
    if (key && val) ext[key] = val;
  });
  return ext;
}

function parseKatalogRow_(row) {
  const aktiv = String(row[11] || 'ja').trim().toLowerCase();
  if (aktiv === 'nein' || aktiv === '0' || aktiv === 'false') return null;

  const features = String(row[7] || '').split('|').map(function (part) {
    return String(part || '').trim();
  }).filter(Boolean);

  const item = {
    reihenfolge: Number(row[0]) || 0,
    typ: String(row[1] || '').trim(),
    id: String(row[2] || '').trim(),
    titel: String(row[3] || '').trim(),
    bild: String(row[4] || '').trim(),
    klassen: String(row[5] || '').trim(),
    features: features,
    aktiv: 'ja'
  };

  const badge = String(row[6] || '').trim();
  if (badge) item.badge = badge;

  const startZustand = String(row[8] || '').trim();
  if (startZustand) item.startZustand = startZustand;

  const bildCode = String(row[9] || '').trim();
  if (bildCode) item.bildCode = bildCode;

  const bildExt = parseKatalogBildExt_(row[10]);
  if (Object.keys(bildExt).length) item.bildExt = bildExt;

  if (!item.id || !item.titel) return null;
  return item;
}

function katalogAusStartRows_() {
  return KATALOG_START_ROWS.map(parseKatalogRow_).filter(Boolean).sort(function (a, b) {
    return a.reihenfolge - b.reihenfolge;
  });
}

function leseKatalog_() {
  const sheet = getSpreadsheet_().getSheetByName('Katalog');
  if (!sheet || sheet.getLastRow() < 2) {
    return katalogAusStartRows_();
  }

  const values = sheet.getDataRange().getValues();
  const items = [];

  for (let i = 1; i < values.length; i++) {
    const item = parseKatalogRow_(values[i]);
    if (item) items.push(item);
  }

  if (!items.length) return katalogAusStartRows_();

  return items.sort(function (a, b) {
    return a.reihenfolge - b.reihenfolge;
  });
}

function lesePreise_() {
  const sheet = getSpreadsheet_().getSheetByName('Preise');
  const preise = Object.assign({}, PREISE_START);

  if (!sheet) return preise;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    const id = String(values[i][0] || '').trim();
    if (!id) continue;
    preise[id] = round2_(Number(values[i][1]) || PREISE_START[id] || 0);
  }

  return preise;
}

function verdaechtigMerken_(txnId, grund, gezahlt, erwartet) {
  try {
    const ss = getSpreadsheet_();
    let sheet = ss.getSheetByName('Verdaechtig');
    if (!sheet) {
      sheet = ss.insertSheet('Verdaechtig');
      sheet.getRange(1, 1, 1, 5).setValues([['zeit', 'txn_id', 'grund', 'gezahlt', 'erwartet']]).setFontWeight('bold');
    }
    sheet.appendRow([new Date().toISOString(), txnId, grund, gezahlt, erwartet]);
  } catch (err) {
    /* optional */
  }
}

function parseUrlEncoded_(raw) {
  const params = {};
  raw.split('&').forEach(function (pair) {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = decodeURIComponent(pair.substring(0, idx).replace(/\+/g, ' '));
    const val = decodeURIComponent(pair.substring(idx + 1).replace(/\+/g, ' '));
    params[key] = val;
  });
  return params;
}

function getRequestParams_(e) {
  if (!e) return {};

  let params = {};
  if (e.parameter && Object.keys(e.parameter).length > 0) {
    params = Object.assign({}, e.parameter);
  }

  if (e.postData && e.postData.contents) {
    const type = e.postData.type || '';
    if (type.indexOf('application/x-www-form-urlencoded') !== -1 || !e.parameter || Object.keys(e.parameter).length === 0) {
      params = Object.assign(params, parseUrlEncoded_(e.postData.contents));
    }
    if (type.indexOf('application/json') !== -1) {
      try {
        params = Object.assign(params, JSON.parse(e.postData.contents));
      } catch (err) {
        /* ignore */
      }
    }
  }

  return params;
}

function parseKontaktBilder_(params) {
  const attachments = [];
  const names = [];

  if (params.bilder) {
    const liste = JSON.parse(params.bilder);
    if (!Array.isArray(liste)) throw new Error('Ungültige Bilddaten');
    if (liste.length > 5) throw new Error('Zu viele Bilder');
    liste.forEach(function (bild, index) {
      attachments.push(Utilities.newBlob(
        Utilities.base64Decode(bild.data),
        bild.type || 'image/jpeg',
        bild.name || ('kundenbild-' + (index + 1) + '.jpg')
      ));
      names.push(bild.name || ('bild-' + (index + 1)));
    });
    return { attachments: attachments, names: names };
  }

  const bildData = (params.bildData || '').trim();
  if (bildData) {
    attachments.push(Utilities.newBlob(
      Utilities.base64Decode(bildData),
      (params.bildType || 'image/jpeg').trim(),
      (params.bildName || 'kundenbild.jpg').trim()
    ));
    names.push((params.bildName || 'kundenbild.jpg').trim());
  }

  return { attachments: attachments, names: names };
}

function handleKontakt_(params) {
  const email = (params.email || '').trim();
  const name = (params.name || '').trim();
  const nachricht = (params.nachricht || '').trim();

  if (!email || !nachricht || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return textResponse_('INVALID');
  }

  if (nachricht.length > 5000) {
    return textResponse_('TOO LONG');
  }

  const subject = 'Kontakt meingameboy.de – ' + (name || email);
  const body = 'Name: ' + (name || '–') + '\nE-Mail: ' + email + '\n\n' + nachricht;

  try {
    const bilder = parseKontaktBilder_(params);
    const mailOptions = {
      to: KONTAKT_EMAIL,
      replyTo: email,
      subject: subject,
      body: body + (bilder.names.length
        ? '\n\n(Bilder im Anhang: ' + bilder.names.join(', ') + ')'
        : '')
    };

    if (bilder.attachments.length > 0) {
      mailOptions.attachments = bilder.attachments;
    }

    MailApp.sendEmail(mailOptions);
    kontaktMerken_(name, email, nachricht, 'gesendet' + (bilder.names.length ? ' + ' + bilder.names.length + ' Bild(er)' : ''));
    return textResponse_('OK');
  } catch (err) {
    kontaktMerken_(name, email, nachricht, 'Fehler: ' + err);
    return textResponse_('ERROR');
  }
}

function kontaktMerken_(name, email, nachricht, status) {
  try {
    const ss = getSpreadsheet_();
    let sheet = ss.getSheetByName('Kontakt');
    if (!sheet) {
      sheet = ss.insertSheet('Kontakt');
      sheet.getRange(1, 1, 1, 5).setValues([['zeit', 'name', 'email', 'nachricht', 'status']]).setFontWeight('bold');
    }
    sheet.appendRow([new Date().toISOString(), name, email, nachricht.substring(0, 500), status]);
  } catch (err) {
    /* optional */
  }
}

function paypalVerifiziert_(params) {
  let payload = 'cmd=_notify-validate';
  Object.keys(params).forEach(function (key) {
    payload += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  });

  const response = UrlFetchApp.fetch(PAYPAL_VERIFY_URL, {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: payload,
    muteHttpExceptions: true
  });

  return response.getContentText().trim() === 'VERIFIED';
}

function leseBestand_() {
  const sheet = getSpreadsheet_().getSheetByName('Bestand');
  const bestand = Object.assign({}, BESTAND_START);

  if (!sheet) return bestand;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    const id = String(values[i][0] || '').trim();
    if (!id) continue;
    bestand[id] = Number(values[i][1]) || 0;
  }

  return bestand;
}

function leseVerkaeufe_(limit) {
  const sheet = getSpreadsheet_().getSheetByName('Verkaeufe');
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  const liste = [];

  for (let i = 1; i < values.length; i++) {
    const produktId = String(values[i][0] || '').trim();
    const datum = formatDatumZelle_(values[i][1]);
    if (!produktId || !datum) continue;
    liste.push({ produktId: produktId, datum: datum });
  }

  return liste.slice(0, limit || 20);
}

function bestandVerringern_(produktId) {
  const sheet = getSpreadsheet_().getSheetByName('Bestand');
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === produktId) {
      const neu = Math.max(0, (Number(values[i][1]) || 0) - 1);
      sheet.getRange(i + 1, 2).setValue(neu);
      return;
    }
  }
}

function verkaufEintragen_(produktId, datum) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName('Verkaeufe');
  if (!sheet) {
    sheet = ss.insertSheet('Verkaeufe');
    sheet.getRange(1, 1, 1, 2).setValues([['produktId', 'datum']]).setFontWeight('bold');
  }
  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, 2).setValues([[produktId, datum]]);
}

function txnBereitsVerarbeitet_(txnId) {
  const sheet = getSpreadsheet_().getSheetByName('Verarbeitet');
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === txnId) {
      return true;
    }
  }

  return false;
}

function txnMerken_(txnId) {
  const sheet = getSpreadsheet_().getSheetByName('Verarbeitet');
  sheet.appendRow([txnId, new Date().toISOString()]);
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function textResponse_(text) {
  return ContentService.createTextOutput(text);
}
