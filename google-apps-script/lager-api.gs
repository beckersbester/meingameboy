/**
 * Restore Gaming – Lager & Verkäufe (Google Sheets + PayPal IPN)
 *
 * EINRICHTUNG (einmalig, ca. 15 Min.):
 *
 * 1. Google Sheet anlegen: https://sheets.new
 * 2. Erweiterungen → Apps Script → diesen Code einfügen
 * 3. In Zeile 8 SPREADSHEET_ID eintragen (aus der Sheet-URL)
 * 4. Funktion „setupLagerSheet“ ausführen (▶) → Tabellen werden angelegt
 * 5. Bereitstellen → Neue Bereitstellung → Web-App
 *    - Als: Ich
 *    - Zugriff: Jeder
 *    → URL kopieren
 * 6. URL in shop.html + index.html bei LAGER_API_URL eintragen
 * 7. shop.html auf GitHub hochladen (notify_url wird automatisch gesetzt)
 *
 * Nach jedem PayPal-Kauf: Bestand −1, Eintrag unter „Kürzlich verkauft“.
 * Manuell anpassen: Spalte B in „Bestand“ oder Zeilen in „Verkaeufe“ bearbeiten.
 */

const SPREADSHEET_ID = '14KYd7DKgw6rUoM7CxylOSBxcfK4zt-3qXy5j0ZleJ-E';
const PAYPAL_VERIFY_URL = 'https://ipnpb.paypal.com/cgi-bin/webscr';
const ZEITZONE = 'Europe/Berlin';
const KONTAKT_EMAIL = 'restore.mail@gmx.de';

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
  'gba-charmander': 0
};

function getSpreadsheet_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf('HIER_') === 0) {
    throw new Error('SPREADSHEET_ID in lager-api.gs eintragen');
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function heuteIso_() {
  return Utilities.formatDate(new Date(), ZEITZONE, 'yyyy-MM-dd');
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

/** Einmal ausführen: legt Tabs an und füllt Start-Bestand */
function setupLagerSheet() {
  const ss = getSpreadsheet_();

  let bestand = ss.getSheetByName('Bestand');
  if (!bestand) {
    bestand = ss.insertSheet('Bestand');
    bestand.getRange(1, 1, 1, 2).setValues([['produktId', 'bestand']]);
    bestand.getRange(1, 1, 1, 2).setFontWeight('bold');
  }
  bestand.clearContents();
  bestand.getRange(1, 1, 1, 2).setValues([['produktId', 'bestand']]);
  bestand.getRange(1, 1, 1, 2).setFontWeight('bold');
  const rows = Object.keys(BESTAND_START).map(function (id) {
    return [id, BESTAND_START[id]];
  });
  bestand.getRange(2, 1, rows.length, 2).setValues(rows);

  let verkaeufe = ss.getSheetByName('Verkaeufe');
  if (!verkaeufe) {
    verkaeufe = ss.insertSheet('Verkaeufe');
  }
  verkaeufe.clearContents();
  verkaeufe.getRange(1, 1, 1, 2).setValues([['produktId', 'datum']]);
  verkaeufe.getRange(1, 1, 1, 2).setFontWeight('bold');
  verkaeufe.getRange(2, 1).setValue('classic');
  verkaeufe.getRange(2, 2).setValue('2026-06-13');

  let verarbeitet = ss.getSheetByName('Verarbeitet');
  if (!verarbeitet) {
    verarbeitet = ss.insertSheet('Verarbeitet');
    verarbeitet.getRange(1, 1, 1, 2).setValues([['txn_id', 'zeit']]);
    verarbeitet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }
}

/** Website ruft diese URL per GET auf (Lager + Kontaktformular) */
function doGet(e) {
  try {
    const params = getRequestParams_(e);

    if (params.action === 'kontakt') {
      return handleKontakt_(params);
    }

    const data = {
      bestand: leseBestand_(),
      verkaeufe: leseVerkaeufe_(20)
    };
    return jsonResponse_(data);
  } catch (err) {
    return jsonResponse_({ error: String(err) });
  }
}

/** PayPal sendet nach jedem Kauf eine POST-Anfrage (IPN) – oder Kontaktformular */
function doPost(e) {
  try {
    const params = getRequestParams_(e);

    if (!params || Object.keys(params).length === 0) {
      return textResponse_('NO DATA');
    }

    if (params.action === 'kontakt') {
      return handleKontakt_(params);
    }
    if (!paypalVerifiziert_(params)) {
      return textResponse_('INVALID');
    }

    const status = params.payment_status || '';
    const txnId = params.txn_id || '';

    if (status !== 'Completed' || !txnId) {
      return textResponse_('IGNORED');
    }

    if (txnBereitsVerarbeitet_(txnId)) {
      return textResponse_('OK');
    }

    const produktId = (params.item_number || '').trim();
    if (!produktId) {
      return textResponse_('NO ITEM');
    }

    bestandVerringern_(produktId);
    verkaufEintragen_(produktId, heuteIso_());
    txnMerken_(txnId);

    return textResponse_('OK');
  } catch (err) {
    return textResponse_('ERROR');
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
  }

  return params;
}

function parseKontaktBilder_(params) {
  const attachments = [];
  const names = [];

  if (params.bilder) {
    const liste = JSON.parse(params.bilder);
    if (!Array.isArray(liste)) {
      throw new Error('Ungültige Bilddaten');
    }
    if (liste.length > 5) {
      throw new Error('Zu viele Bilder');
    }
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

    kontaktMerken_(
      name,
      email,
      nachricht,
      'gesendet' + (bilder.names.length ? ' + ' + bilder.names.length + ' Bild(er)' : '')
    );
    return textResponse_('OK');
  } catch (err) {
    kontaktMerken_(name, email, nachricht, 'Fehler: ' + err);
    return textResponse_('ERROR');
  }
}

/** Im Script-Editor ausführen – zeigt echte Fehler im Protokoll */
function testKontaktSend() {
  const result = handleKontakt_({
    name: 'Test',
    email: 'brother.louie007@gmail.com',
    nachricht: 'Test vom Apps Script Editor – wenn du das liest, funktioniert der Mailversand.'
  });

  const antwort = result.getContent();
  Logger.log('Antwort: ' + antwort);

  if (antwort !== 'OK') {
    throw new Error(
      'E-Mail konnte nicht gesendet werden (Antwort: ' + antwort + '). ' +
      'Tab „Kontakt“ im Google Sheet prüfen – dort steht der genaue Fehler.'
    );
  }

  Logger.log('Erfolg! Prüfe restore.mail@gmx.de (ggf. Spam-Ordner).');
}

function kontaktMerken_(name, email, nachricht, status) {
  try {
    const ss = getSpreadsheet_();
    let sheet = ss.getSheetByName('Kontakt');
    if (!sheet) {
      sheet = ss.insertSheet('Kontakt');
      sheet.getRange(1, 1, 1, 5).setValues([['zeit', 'name', 'email', 'nachricht', 'status']]);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }
    sheet.appendRow([new Date().toISOString(), name, email, nachricht.substring(0, 500), status]);
  } catch (err) {
    /* Protokoll optional */
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
  const values = sheet.getDataRange().getValues();
  const bestand = {};

  for (let i = 1; i < values.length; i++) {
    const id = String(values[i][0] || '').trim();
    if (!id) continue;
    bestand[id] = Number(values[i][1]) || 0;
  }

  return bestand;
}

function leseVerkaeufe_(limit) {
  const sheet = getSpreadsheet_().getSheetByName('Verkaeufe');
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
