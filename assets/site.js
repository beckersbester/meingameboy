const SITE_API_URL = 'https://script.google.com/macros/s/AKfycbyNYtUSgXDSb-jhofgXPWr_xrTCR4MaL5I01qrCTnmNQRb85EfRDTVnnEfSeTCdVLvl/exec';

const NAV_ITEMS = [
  { id: 'start', label: 'Start', href: 'index.html' },
  { id: 'shop', label: 'Shop', href: 'shop.html' },
  { id: 'geschichte', label: 'Geschichte', href: 'geschichte.html' },
  { id: 'bewertungen', label: 'Bewertungen', href: 'bewertungen.html' }
];

const MINI_GAME_NAV = { id: 'spiel', label: 'Mini-Game', href: 'spiel.html' };

function buildSiteNav(activeId) {
  const links = NAV_ITEMS.map(function (item) {
    const cls = item.id === activeId ? ' class="active"' : '';
    return '<a href="' + item.href + '"' + cls + '>' + item.label + '</a>';
  }).join('');

  const miniGameCls = MINI_GAME_NAV.id === activeId ? ' class="active"' : '';

  return (
    '<nav class="site-nav" aria-label="Hauptnavigation">' +
      links +
      '<button type="button" class="nav-warenkorb" id="warenkorb-open">Warenkorb <span class="warenkorb-badge" id="warenkorb-badge" hidden>0</span></button>' +
      '<button type="button" class="nav-kontakt" id="kontakt-open">Kontakt</button>' +
      '<a href="' + MINI_GAME_NAV.href + '"' + miniGameCls + '>' + MINI_GAME_NAV.label + '</a>' +
    '</nav>'
  );
}

function buildWarenkorbModal() {
  return (
    '<div class="modal-overlay" id="warenkorb-modal" aria-hidden="true">' +
      '<div class="modal modal-wide" role="dialog" aria-labelledby="warenkorb-titel">' +
        '<button type="button" class="modal-close" id="warenkorb-close" aria-label="Schließen">&times;</button>' +
        '<h2 id="warenkorb-titel">Warenkorb</h2>' +
        '<p class="modal-intro">Artikel hinzufügen, Rabattcode eingeben – sicher bezahlen über PayPal.</p>' +
        '<p class="warenkorb-leer" id="warenkorb-leer">Dein Warenkorb ist noch leer.</p>' +
        '<ul class="warenkorb-liste" id="warenkorb-liste"></ul>' +
        '<div class="warenkorb-summary" id="warenkorb-summary" hidden>' +
          '<label class="warenkorb-rabatt-label">Rabattcode (optional)' +
            '<div class="warenkorb-rabatt-row">' +
              '<input type="text" id="warenkorb-rabatt" placeholder="z.B. GAMEBOY5" autocapitalize="characters">' +
              '<button type="button" class="button button-rabatt-check" id="warenkorb-rabatt-check">Code prüfen</button>' +
            '</div>' +
          '</label>' +
          '<p class="warenkorb-rabatt-hinweis" id="warenkorb-rabatt-hinweis" aria-live="polite">Code eingeben und auf „Code prüfen“ klicken.</p>' +
          '<div class="warenkorb-preise-box" id="warenkorb-preise-box">' +
            '<p class="warenkorb-zwischensumme">Zwischensumme: <strong id="warenkorb-zwischensumme">0,00 €</strong></p>' +
            '<p class="warenkorb-rabatt-zeile" id="warenkorb-rabatt-zeile" hidden>Rabatt (<span id="warenkorb-rabatt-prozent">0&nbsp;%</span>): <strong id="warenkorb-rabatt-betrag">−0,00 €</strong></p>' +
            '<p class="warenkorb-endpreis">Du zahlst: <strong id="warenkorb-endpreis">0,00 €</strong></p>' +
          '</div>' +
          '<button type="button" class="button button-checkout" id="warenkorb-checkout">Zur Kasse mit PayPal</button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function buildKontaktModal() {
  return (
    '<div class="modal-overlay" id="kontakt-modal" aria-hidden="true">' +
      '<div class="modal" role="dialog" aria-labelledby="kontakt-titel">' +
        '<button type="button" class="modal-close" id="kontakt-close" aria-label="Schließen">&times;</button>' +
        '<h2 id="kontakt-titel">Kontakt</h2>' +
        '<p class="modal-intro">Schreib mir deine Frage – ich melde mich per E-Mail zurück.</p>' +
        '<form class="kontakt-form" id="kontakt-form">' +
          '<label>Name<input type="text" name="name" autocomplete="name" placeholder="Dein Name"></label>' +
          '<label>E-Mail *<input type="email" name="email" required autocomplete="email" placeholder="deine@email.de"></label>' +
          '<label>Nachricht *<textarea name="nachricht" required placeholder="Worum geht es?"></textarea></label>' +
          '<label class="kontakt-bild-label">Bilder anhängen (optional)' +
            '<input type="file" name="bild" accept="image/jpeg,image/png,image/webp,image/gif" multiple>' +
          '</label>' +
          '<p class="kontakt-hinweis">JPG, PNG, WEBP oder GIF · max. 5 Bilder · je 4&nbsp;MB</p>' +
          '<p class="kontakt-dateiname" id="kontakt-dateiname" hidden></p>' +
          '<button type="submit" class="button">Nachricht senden</button>' +
          '<p class="kontakt-status" id="kontakt-status" aria-live="polite"></p>' +
        '</form>' +
      '</div>' +
    '</div>'
  );
}

function buildSiteFooter() {
  const links = [
    { href: 'ueber-uns.html', label: 'Über mich' },
    { href: 'shop.html#versand', label: 'Versandbedingungen' },
    { href: 'impressum.html', label: 'Impressum' },
    { href: 'datenschutz.html', label: 'Datenschutz' }
  ].map(function (item) {
    return '<a href="' + item.href + '">' + item.label + '</a>';
  }).join('');

  return (
    '<div class="footer-links">' + links + '</div>' +
    '<p class="footer-brand">meingameboy.de by Restore Gaming</p>'
  );
}

function initSiteFooter() {
  const footer = document.querySelector('body > footer');
  if (!footer) return;
  footer.innerHTML = buildSiteFooter();
}

function initSiteNav() {
  const activeId = document.body.dataset.page || '';
  const header = document.querySelector('header');
  if (!header) return;

  const existingNav = document.querySelector('.site-nav');
  if (existingNav) {
    existingNav.outerHTML = buildSiteNav(activeId);
  } else {
    header.insertAdjacentHTML('afterend', buildSiteNav(activeId));
  }

  if (document.body.dataset.siteShellReady === '1') return;
  document.body.dataset.siteShellReady = '1';

  document.body.insertAdjacentHTML('beforeend', buildKontaktModal());
  document.body.insertAdjacentHTML('beforeend', buildWarenkorbModal());

  document.getElementById('kontakt-open').addEventListener('click', openKontaktModal);
  document.getElementById('kontakt-close').addEventListener('click', closeKontaktModal);
  document.getElementById('kontakt-modal').addEventListener('click', function (e) {
    if (e.target.id === 'kontakt-modal') closeKontaktModal();
  });
  document.getElementById('kontakt-form').addEventListener('submit', submitKontaktForm);

  const bildInput = document.querySelector('#kontakt-form input[name="bild"]');
  const dateiname = document.getElementById('kontakt-dateiname');
  if (bildInput && dateiname) {
    bildInput.addEventListener('change', function () {
      const files = Array.from(bildInput.files || []);
      if (files.length === 0) {
        dateiname.hidden = true;
        dateiname.textContent = '';
        return;
      }
      if (files.length === 1) {
        dateiname.textContent = 'Ausgewählt: ' + files[0].name;
      } else {
        dateiname.textContent = files.length + ' Bilder: ' + files.map(function (f) { return f.name; }).join(', ');
      }
      dateiname.hidden = false;
    });
  }

  document.querySelectorAll('[data-kontakt]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openKontaktModal();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeKontaktModal();
      if (typeof ShopCart !== 'undefined') ShopCart.closeModal();
    }
  });

  if (window.location.hash === '#kontakt') openKontaktModal();
}

function openKontaktModal() {
  const modal = document.getElementById('kontakt-modal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  const emailInput = modal.querySelector('input[name="email"]');
  if (emailInput) setTimeout(function () { emailInput.focus(); }, 100);
}

function closeKontaktModal() {
  const modal = document.getElementById('kontakt-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

const KONTAKT_MAX_BILD = 4 * 1024 * 1024;
const KONTAKT_MAX_BILDER = 5;

function readFilesAsBase64(files) {
  return Promise.all(files.map(function (file) {
    return readFileAsBase64(file).then(function (dataUrl) {
      return {
        name: file.name,
        type: file.type,
        data: dataUrl.split(',')[1]
      };
    });
  }));
}
function readFileAsBase64(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function validateKontaktBilder(files) {
  if (files.length > KONTAKT_MAX_BILDER) {
    return 'Maximal ' + KONTAKT_MAX_BILDER + ' Bilder erlaubt.';
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith('image/')) {
      return 'Bitte nur Bilddateien (JPG, PNG, WEBP, GIF) anhängen.';
    }
    if (file.size > KONTAKT_MAX_BILD) {
      return '"' + file.name + '" ist zu groß. Maximal 4 MB pro Bild.';
    }
  }

  return '';
}

function sendKontaktRequest(params, usePost) {
  if (usePost) {
    return fetch(SITE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    }).then(function (response) { return response.text(); });
  }

  return fetch(SITE_API_URL + '?' + params.toString())
    .then(function (response) { return response.text(); });
}

function handleKontaktResponse(text, form, status, button) {
  if (text.trim() === 'OK') {
    status.textContent = 'Danke! Deine Nachricht wurde gesendet – ich melde mich bald.';
    status.className = 'kontakt-status ok';
    form.reset();
    const dateiname = document.getElementById('kontakt-dateiname');
    if (dateiname) {
      dateiname.hidden = true;
      dateiname.textContent = '';
    }
  } else {
    status.textContent = 'Senden fehlgeschlagen. Bitte später erneut versuchen oder restore.mail@gmx.de direkt schreiben.';
    status.className = 'kontakt-status err';
  }
  button.disabled = false;
}

async function submitKontaktForm(e) {
  e.preventDefault();

  const form = e.target;
  const status = document.getElementById('kontakt-status');
  const button = form.querySelector('button[type="submit"]');
  const email = form.email.value.trim();
  const nachricht = form.nachricht.value.trim();
  const bildInput = form.querySelector('input[name="bild"]');
  const files = bildInput ? Array.from(bildInput.files || []) : [];

  if (!email || !nachricht) {
    status.textContent = 'Bitte E-Mail und Nachricht ausfüllen.';
    status.className = 'kontakt-status err';
    return;
  }

  const bildFehler = validateKontaktBilder(files);
  if (bildFehler) {
    status.textContent = bildFehler;
    status.className = 'kontakt-status err';
    return;
  }

  button.disabled = true;
  status.textContent = files.length
    ? 'Wird gesendet … ' + files.length + (files.length === 1 ? ' Bild' : ' Bilder') + ' werden hochgeladen'
    : 'Wird gesendet …';
  status.className = 'kontakt-status';

  const params = new URLSearchParams({
    action: 'kontakt',
    name: form.name.value.trim(),
    email: email,
    nachricht: nachricht
  });

  try {
    if (files.length > 0) {
      const bilder = await readFilesAsBase64(files);
      params.append('bilder', JSON.stringify(bilder));
    }

    const text = await sendKontaktRequest(params, files.length > 0);
    handleKontaktResponse(text, form, status, button);
  } catch (error) {
    status.textContent = 'Verbindungsfehler. Bitte später erneut versuchen.';
    status.className = 'kontakt-status err';
    button.disabled = false;
  }
}

function initSiteHeader() {
  const h1Link = document.querySelector('header h1 a');
  if (h1Link && !h1Link.querySelector('.site-domain')) {
    const text = h1Link.textContent.trim();
    if (text === 'meingameboy.de') {
      h1Link.innerHTML = 'meingameboy<span class="site-domain">.de</span>';
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  initSiteHeader();
  initSiteNav();
  initSiteFooter();
});
