/**
 * Restore Gaming – Lager, Warenkorb-Checkout, Rabattcodes, PayPal IPN
 *
 * Tabs im Google Sheet: Bestand, Preise, Rabattcodes, Verkaeufe, Verarbeitet, Verdaechtig, Kontakt
 * setupLagerSheet einmal ausführen nach Update.
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
  'pocket-orange': 1,
  'pocket-squirtle': 2,
  'pocket-charizard': 1,
  'pocket-pikachu': 2,
  'pocket-classic': 2,
  'color-mario': 1,
  'classic-black-ips': 1,
  'classic-red': 1,
  'pocket-transparent': 1,
  'color-pokemon': 1,
  'color-charizard-orange': 1,
  'color-yellow': 3,
  'classic-grau-ips': 1,
  'gba-gengar': 0,
  'gba-charmander': 0,
  'spiel-sm1-z1': 1,
  'spiel-sm1-z2': 1,
  'spiel-sm1-z3': 1,
  'spiel-sm1-z4': 0,
  'spiel-sm2-z1': 1,
  'spiel-sm2-z2': 0,
  'spiel-sm2-z3': 1,
  'spiel-sm2-z4': 1,
  'spiel-sm3-z1': 1,
  'spiel-sm3-z2': 1,
  'spiel-sm3-z3': 1,
  'spiel-sm3-z4': 1
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
  'spiel-sm3-z4': 59.99
};

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

const RABATT_START = [
  ['code', 'typ', 'wert', 'aktiv', 'notiz'],
  ['GAMEBOY5', 'prozent', 5, 'ja', 'Standard-Rabatt 5 %'],
  ['PIXELDK', 'prozent', 1, 'ja', 'RGB-Checker Mini-Game'],
  ['WARIOWX', 'prozent', 2, 'ja', 'RGB-Checker Mini-Game'],
  ['MARIOGB', 'prozent', 3, 'ja', 'RGB-Checker Mini-Game'],
  ['LANDONE', 'prozent', 4, 'ja', 'RGB-Checker Mini-Game'],
  ['DMGSCOR', 'prozent', 5, 'ja', 'RGB-Checker Mini-Game'],
  ['LINKCAB', 'prozent', 6, 'ja', 'RGB-Checker Mini-Game'],
  ['KONAMIX', 'prozent', 7, 'ja', 'RGB-Checker Mini-Game'],
  ['POCKETX', 'prozent', 8, 'ja', 'RGB-Checker Mini-Game'],
  ['RETROFX', 'prozent', 9, 'ja', 'RGB-Checker Mini-Game'],
  ['FULLRGB', 'prozent', 10, 'ja', 'RGB-Checker Mini-Game']
];

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

function buildRabattHinweis_(rabattCode, priced) {
  if (!rabattCode) return '';
  if (priced.rabattCode) {
    const prozentText = priced.rabattProzent != null ? ' (' + priced.rabattProzent + ' % Rabatt)' : '';
    if (priced.discount > 0) {
      return 'Code ' + priced.rabattCode + ' erkannt' + prozentText + ' – du sparst ' + priced.discount.toFixed(2).replace('.', ',') + ' €.';
    }
    return 'Code ' + priced.rabattCode + ' erkannt' + prozentText + '.';
  }
  return 'Code „' + rabattCode + '“ ist ungültig oder nicht aktiv.';
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

    return jsonResponse_({
      ok: true,
      subtotal: priced.subtotal,
      discount: priced.discount,
      total: priced.total,
      rabattGueltig: rabattCode ? !!priced.rabattCode : null,
      rabattProzent: priced.rabattProzent,
      rabattTyp: priced.rabattTyp || '',
      rabattHinweis: buildRabattHinweis_(rabattCode, priced)
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
      rabattHinweis: buildRabattHinweis_(rabattCode, priced)
    });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err.message || err) });
  }
}

function berechneWarenkorbPreise_(lines, rabattCode) {
  const subtotal = round2_(lines.reduce(function (sum, line) {
    return sum + line.unitPrice * line.qty;
  }, 0));

  let discount = 0;
  let appliedCode = '';
  let rabattProzent = null;
  let rabattTyp = '';
  const rabatt = lookupRabatt_(rabattCode);

  if (rabatt) {
    appliedCode = rabatt.code;
    rabattTyp = rabatt.typ;
    if (rabatt.typ === 'prozent') {
      rabattProzent = normalizeProzentWert_(rabatt.wert);
      discount = round2_(subtotal * rabattProzent / 100);
    } else if (rabatt.typ === 'fest') {
      discount = round2_(Math.min(subtotal, rabatt.wert));
    }
  }

  const targetTotal = round2_(subtotal - discount);
  const factor = subtotal > 0 ? targetTotal / subtotal : 1;

  const discountedLines = lines.map(function (line) {
    return {
      produktId: line.produktId,
      name: line.name,
      qty: line.qty,
      unitPrice: round2_(line.unitPrice * factor)
    };
  });

  const total = round2_(discountedLines.reduce(function (sum, line) {
    return sum + line.unitPrice * line.qty;
  }, 0));

  const actualDiscount = round2_(subtotal - total);
  if (actualDiscount > 0 && subtotal > 0 && (!rabattProzent || rabattProzent <= 0)) {
    rabattProzent = Math.round(actualDiscount / subtotal * 100);
  }

  return {
    lines: discountedLines,
    subtotal: subtotal,
    discount: actualDiscount,
    total: total,
    rabattCode: appliedCode,
    rabattProzent: rabattProzent,
    rabattTyp: rabattTyp
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

  const rabattCode = String(params.custom || '').trim().toUpperCase();
  const validation = validiereIpnBetrag_(items, rabattCode, parseFloat(params.mc_gross));

  if (!validation.ok) {
    verdaechtigMerken_(txnId, validation.grund, params.mc_gross, validation.erwartet);
    return textResponse_('REJECTED');
  }

  items.forEach(function (item) {
    for (let i = 0; i < item.qty; i++) {
      bestandVerringern_(item.produktId);
      verkaufEintragen_(item.produktId, heuteIso_());
    }
  });

  txnMerken_(txnId);
  return textResponse_('OK');
}

function parseIpnItems_(params) {
  const num = parseInt(params.num_cart_items || '0', 10);
  const items = [];

  if (num > 0) {
    for (let i = 1; i <= num; i++) {
      const produktId = String(params['item_number' + i] || '').trim();
      const qty = Math.max(1, parseInt(params['quantity' + i] || '1', 10));
      const amount = parseFloat(params['mc_gross_' + i] || '0');
      if (!produktId) continue;
      items.push({ produktId: produktId, qty: qty, lineTotal: round2_(amount) });
    }
    return items;
  }

  const produktId = String(params.item_number || '').trim();
  if (!produktId) return [];
  return [{
    produktId: produktId,
    qty: Math.max(1, parseInt(params.quantity || '1', 10)),
    lineTotal: round2_(parseFloat(params.mc_gross || '0'))
  }];
}

function validiereIpnBetrag_(ipnItems, rabattCode, paidTotal) {
  const preise = lesePreise_();
  const lines = [];

  ipnItems.forEach(function (item) {
    if (!preise[item.produktId]) {
      return { ok: false, grund: 'Unbekannte produktId: ' + item.produktId, erwartet: '' };
    }
    lines.push({
      produktId: item.produktId,
      name: PRODUKT_NAMEN[item.produktId] || item.produktId,
      qty: item.qty,
      unitPrice: round2_(preise[item.produktId])
    });
  });

  const priced = berechneWarenkorbPreise_(lines, rabattCode);
  const expectedLineTotal = round2_(priced.total);
  const paid = round2_(paidTotal);

  if (Math.abs(paid - expectedLineTotal) > PREIS_TOLERANZ) {
    return {
      ok: false,
      grund: 'Betrag stimmt nicht (Rabatt: ' + (rabattCode || 'keiner') + ')',
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
  const sheet = getSpreadsheet_().getSheetByName('Verkaeufe');
  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 2, 2).setValues([[produktId, datum]]);
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
