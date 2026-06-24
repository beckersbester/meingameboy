(function (global) {
  'use strict';

  var WEB_RABATT = 0.95;
  var KOMBI_RABATT = 0.95;
  var KOMBI_CODE = 'GAMEBOY5';
  var KOMBI_MIN_ARTIKEL = 2;

  function round2(n) {
    return Math.round(Number(n) * 100) / 100;
  }

  function istSpielProdukt(produktId) {
    return String(produktId || '').indexOf('spiel-') === 0;
  }

  /** Konsolen: abrunden auf ,99 € */
  function abrundenAuf99(betrag) {
    var b = round2(betrag);
    var euro = Math.floor(b);
    if (round2(b - euro) >= 0.99) return round2(euro + 0.99);
    if (euro < 1) return 0.99;
    return round2(euro - 1 + 0.99);
  }

  /** Spiele: abrunden auf Cent-Betrag mit Endziffer 9 (,09 … ,99) */
  function abrundenAuf9Cent(betrag) {
    var maxCents = Math.floor(round2(betrag) * 100 + 1e-9);
    for (var c = maxCents; c >= 9; c--) {
      if (c % 10 === 9) return round2(c / 100);
    }
    return 0.09;
  }

  function rundeShopPreis(betrag, produktId) {
    if (istSpielProdukt(produktId)) return abrundenAuf9Cent(betrag);
    return abrundenAuf99(betrag);
  }

  function websiteEinzelpreis(listenpreis, produktId) {
    return rundeShopPreis(round2(Number(listenpreis) * WEB_RABATT), produktId);
  }

  function kombiEinzelpreis(websitePreis, produktId) {
    return rundeShopPreis(round2(Number(websitePreis) * KOMBI_RABATT), produktId);
  }

  function zaehleArtikel(lines) {
    return lines.reduce(function (sum, line) {
      return sum + (Number(line.qty) || 0);
    }, 0);
  }

  function berechneZeilen(listenLines, rabattCode) {
    var artikelAnzahl = zaehleArtikel(listenLines);
    var code = String(rabattCode || '').trim().toUpperCase();
    var kombiAktiv = artikelAnzahl >= KOMBI_MIN_ARTIKEL && code === KOMBI_CODE;

    var listSubtotal = round2(listenLines.reduce(function (sum, line) {
      return sum + round2(line.unitPrice) * line.qty;
    }, 0));

    var websiteSubtotal = 0;
    var pricedLines = listenLines.map(function (line) {
      var listUnit = round2(line.unitPrice);
      var webUnit = websiteEinzelpreis(listUnit, line.produktId);
      websiteSubtotal = round2(websiteSubtotal + webUnit * line.qty);
      var finalUnit = kombiAktiv ? kombiEinzelpreis(webUnit, line.produktId) : webUnit;
      return {
        produktId: line.produktId,
        name: line.name,
        qty: line.qty,
        listUnitPrice: listUnit,
        websiteUnitPrice: webUnit,
        unitPrice: finalUnit
      };
    });

    var total = round2(pricedLines.reduce(function (sum, line) {
      return sum + line.unitPrice * line.qty;
    }, 0));

    var kombiDiscount = kombiAktiv ? round2(websiteSubtotal - total) : 0;
    var websiteDiscount = round2(listSubtotal - websiteSubtotal);
    var totalDiscount = round2(listSubtotal - total);

    return {
      lines: pricedLines,
      listSubtotal: listSubtotal,
      websiteSubtotal: websiteSubtotal,
      subtotal: listSubtotal,
      websiteDiscount: websiteDiscount,
      kombiDiscount: kombiDiscount,
      discount: totalDiscount,
      total: total,
      artikelAnzahl: artikelAnzahl,
      kombiAktiv: kombiAktiv,
      kombiCode: kombiAktiv ? KOMBI_CODE : '',
      rabattCode: kombiAktiv ? KOMBI_CODE : 'WEBSHOP',
      rabattProzent: kombiAktiv ? 10 : 5,
      rabattTyp: 'prozent',
      rabattGueltig: code ? (code === KOMBI_CODE ? kombiAktiv : false) : null,
      rabattHinweis: buildRabattHinweis(listSubtotal, websiteSubtotal, total, kombiAktiv, code, artikelAnzahl)
    };
  }

  function buildRabattHinweis(listSubtotal, websiteSubtotal, total, kombiAktiv, code, artikelAnzahl) {
    var webSpar = round2(listSubtotal - websiteSubtotal);
    var gesamtSpar = round2(listSubtotal - total);

    if (code === KOMBI_CODE && !kombiAktiv) {
      if (artikelAnzahl < KOMBI_MIN_ARTIKEL) {
        return 'CODE GAMEBOY5 gilt ab ' + KOMBI_MIN_ARTIKEL + ' Artikeln – Webshop-Preis (5 %) ist bereits aktiv.';
      }
      return 'CODE GAMEBOY5 ist ungültig oder nicht aktiv.';
    }

    if (kombiAktiv) {
      return 'Webshop-Preis inkl. 5 % (−' + formatEuro(webSpar) + ') + CODE GAMEBOY5 extra 5 % – gesamt sparst du ' + formatEuro(gesamtSpar) + '.';
    }

    var hint = 'Webshop-Preis: immer 5 % günstiger – du sparst ' + formatEuro(webSpar) + '.';
    if (artikelAnzahl < KOMBI_MIN_ARTIKEL) {
      hint += ' Noch ' + (KOMBI_MIN_ARTIKEL - artikelAnzahl) + ' Artikel für nochmal 5 % auf den Warenkorb mit CODE GAMEBOY5.';
    } else {
      hint += ' Ab 2 Artikeln: nochmal 5 % auf den Warenkorb mit CODE GAMEBOY5.';
    }
    return hint;
  }

  function formatEuro(value) {
    return Number(value).toFixed(2).replace('.', ',') + ' €';
  }

  global.ShopPreise = {
    WEB_RABATT: WEB_RABATT,
    KOMBI_CODE: KOMBI_CODE,
    KOMBI_MIN_ARTIKEL: KOMBI_MIN_ARTIKEL,
    istSpielProdukt: istSpielProdukt,
    abrundenAuf99: abrundenAuf99,
    abrundenAuf9Cent: abrundenAuf9Cent,
    rundeShopPreis: rundeShopPreis,
    websiteEinzelpreis: websiteEinzelpreis,
    kombiEinzelpreis: kombiEinzelpreis,
    berechneWarenkorb: berechneZeilen,
    buildRabattHinweis: buildRabattHinweis
  };
})(typeof window !== 'undefined' ? window : this);
