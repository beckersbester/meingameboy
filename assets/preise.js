(function (global) {
  'use strict';

  var WEB_RABATT = 0.95;
  var KOMBI_RABATT_PROZENT = 5;
  var KOMBI_CODE = 'GAMEBOY5';
  var KOMBI_MIN_ARTIKEL = 2;

  function round2(n) {
    return Math.round(Number(n) * 100) / 100;
  }

  function istSpielProdukt(produktId) {
    return String(produktId || '').indexOf('spiel-') === 0;
  }

  function abrundenAuf99(betrag) {
    var b = round2(betrag);
    var euro = Math.floor(b);
    if (round2(b - euro) >= 0.99) return round2(euro + 0.99);
    if (euro < 1) return 0.99;
    return round2(euro - 1 + 0.99);
  }

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

  function zaehleArtikel(lines) {
    return lines.reduce(function (sum, line) {
      return sum + (Number(line.qty) || 0);
    }, 0);
  }

  function verteileKombiRabatt_(lines, websiteSubtotal, targetTotal) {
    if (websiteSubtotal <= 0) return lines;

    var factor = targetTotal / websiteSubtotal;
    var running = 0;
    var lastIndex = lines.length - 1;

    return lines.map(function (line, index) {
      var lineWeb = round2(line.websiteUnitPrice * line.qty);
      var lineTotal;

      if (index === lastIndex) {
        lineTotal = round2(targetTotal - running);
      } else {
        lineTotal = round2(lineWeb * factor);
        running = round2(running + lineTotal);
      }

      return {
        produktId: line.produktId,
        name: line.name,
        qty: line.qty,
        websiteUnitPrice: line.websiteUnitPrice,
        unitPrice: round2(lineTotal / line.qty)
      };
    });
  }

  function berechneZeilen(listenLines, rabattCode) {
    var artikelAnzahl = zaehleArtikel(listenLines);
    var code = String(rabattCode || '').trim().toUpperCase();
    var kombiAktiv = artikelAnzahl >= KOMBI_MIN_ARTIKEL && code === KOMBI_CODE;

    var websiteSubtotal = 0;
    var baseLines = listenLines.map(function (line) {
      var listUnit = round2(line.unitPrice);
      var webUnit = websiteEinzelpreis(listUnit, line.produktId);
      websiteSubtotal = round2(websiteSubtotal + webUnit * line.qty);
      return {
        produktId: line.produktId,
        name: line.name,
        qty: line.qty,
        websiteUnitPrice: webUnit,
        unitPrice: webUnit
      };
    });

    var kombiDiscount = 0;
    var total = websiteSubtotal;
    var pricedLines = baseLines;

    if (kombiAktiv) {
      kombiDiscount = round2(websiteSubtotal * KOMBI_RABATT_PROZENT / 100);
      total = round2(websiteSubtotal - kombiDiscount);
      pricedLines = verteileKombiRabatt_(baseLines, websiteSubtotal, total);
    }

    return {
      lines: pricedLines,
      websiteSubtotal: websiteSubtotal,
      subtotal: websiteSubtotal,
      discount: kombiDiscount,
      total: total,
      artikelAnzahl: artikelAnzahl,
      kombiAktiv: kombiAktiv,
      rabattCode: kombiAktiv ? KOMBI_CODE : '',
      rabattProzent: kombiAktiv ? KOMBI_RABATT_PROZENT : null,
      rabattTyp: kombiAktiv ? 'prozent' : '',
      rabattGueltig: code ? (code === KOMBI_CODE ? kombiAktiv : false) : null,
      rabattHinweis: buildRabattHinweis(kombiAktiv, code, artikelAnzahl, kombiDiscount)
    };
  }

  function buildRabattHinweis(kombiAktiv, code, artikelAnzahl, kombiDiscount) {
    if (!code) return '';

    if (code === KOMBI_CODE && !kombiAktiv) {
      if (artikelAnzahl < KOMBI_MIN_ARTIKEL) {
        return 'CODE GAMEBOY5 gilt ab ' + KOMBI_MIN_ARTIKEL + ' Artikeln.';
      }
      return 'CODE GAMEBOY5 ist ungültig oder nicht aktiv.';
    }

    if (kombiAktiv) {
      return 'CODE GAMEBOY5 – nochmal 5 % auf den Warenkorb (−' + formatEuro(kombiDiscount) + ').';
    }

    return '';
  }

  function formatEuro(value) {
    return Number(value).toFixed(2).replace('.', ',') + ' €';
  }

  global.ShopPreise = {
    KOMBI_CODE: KOMBI_CODE,
    KOMBI_MIN_ARTIKEL: KOMBI_MIN_ARTIKEL,
    istSpielProdukt: istSpielProdukt,
    websiteEinzelpreis: websiteEinzelpreis,
    berechneWarenkorb: berechneZeilen
  };
})(typeof window !== 'undefined' ? window : this);
