const SITE_API_URL = 'https://script.google.com/macros/s/AKfycbyNYtUSgXDSb-jhofgXPWr_xrTCR4MaL5I01qrCTnmNQRb85EfRDTVnnEfSeTCdVLvl/exec';

const NAV_ITEMS = [
  { id: 'start', label: 'Start', href: 'index.html' },
  { id: 'shop', label: 'Shop', href: 'shop.html' },
  { id: 'verkaeufe', label: 'Verkäufe', href: 'verkaeufe.html' },
  { id: 'bewertungen', label: 'Bewertungen', href: 'bewertungen.html' },
  { id: 'ueber-uns', label: 'Über uns', href: 'ueber-uns.html' }
];

function buildSiteNav(activeId) {
  const links = NAV_ITEMS.map(function (item) {
    const cls = item.id === activeId ? ' class="active"' : '';
    return '<a href="' + item.href + '"' + cls + '>' + item.label + '</a>';
  }).join('');

  return (
    '<nav class="site-nav" aria-label="Hauptnavigation">' +
      links +
      '<button type="button" class="nav-kontakt" id="kontakt-open">Kontakt</button>' +
    '</nav>'
  );
}

function buildKontaktModal() {
  return (
    '<div class="modal-overlay" id="kontakt-modal" aria-hidden="true">' +
      '<div class="modal" role="dialog" aria-labelledby="kontakt-titel">' +
        '<button type="button" class="modal-close" id="kontakt-close" aria-label="Schließen">&times;</button>' +
        '<h2 id="kontakt-titel">Kontakt</h2>' +
        '<p class="modal-intro">Schreib uns deine Frage – wir melden uns per E-Mail zurück.</p>' +
        '<form class="kontakt-form" id="kontakt-form">' +
          '<label>Name<input type="text" name="name" autocomplete="name" placeholder="Dein Name"></label>' +
          '<label>E-Mail *<input type="email" name="email" required autocomplete="email" placeholder="deine@email.de"></label>' +
          '<label>Nachricht *<textarea name="nachricht" required placeholder="Worum geht es?"></textarea></label>' +
          '<button type="submit" class="button">Nachricht senden</button>' +
          '<p class="kontakt-status" id="kontakt-status" aria-live="polite"></p>' +
        '</form>' +
      '</div>' +
    '</div>' +
    '<iframe name="kontakt-frame" id="kontakt-frame" hidden title="Kontaktformular"></iframe>'
  );
}

function initSiteNav() {
  const activeId = document.body.dataset.page || '';
  const header = document.querySelector('header');
  if (!header || document.querySelector('.site-nav')) return;

  header.insertAdjacentHTML('afterend', buildSiteNav(activeId));

  document.body.insertAdjacentHTML('beforeend', buildKontaktModal());

  document.getElementById('kontakt-open').addEventListener('click', openKontaktModal);
  document.getElementById('kontakt-close').addEventListener('click', closeKontaktModal);
  document.getElementById('kontakt-modal').addEventListener('click', function (e) {
    if (e.target.id === 'kontakt-modal') closeKontaktModal();
  });
  document.getElementById('kontakt-form').addEventListener('submit', submitKontaktForm);

  document.querySelectorAll('[data-kontakt]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openKontaktModal();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeKontaktModal();
  });

  if (window.location.hash === '#kontakt') openKontaktModal();
}

function openKontaktModal() {
  const modal = document.getElementById('kontakt-modal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const emailInput = modal.querySelector('input[name="email"]');
  if (emailInput) setTimeout(function () { emailInput.focus(); }, 100);
}

function closeKontaktModal() {
  const modal = document.getElementById('kontakt-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function submitKontaktForm(e) {
  e.preventDefault();

  const form = e.target;
  const status = document.getElementById('kontakt-status');
  const button = form.querySelector('button[type="submit"]');
  const email = form.email.value.trim();
  const nachricht = form.nachricht.value.trim();

  if (!email || !nachricht) {
    status.textContent = 'Bitte E-Mail und Nachricht ausfüllen.';
    status.className = 'kontakt-status err';
    return;
  }

  button.disabled = true;
  status.textContent = 'Wird gesendet …';
  status.className = 'kontakt-status';

  const hiddenForm = document.createElement('form');
  hiddenForm.method = 'POST';
  hiddenForm.action = SITE_API_URL;
  hiddenForm.target = 'kontakt-frame';
  hiddenForm.style.display = 'none';

  [
    ['action', 'kontakt'],
    ['name', form.name.value.trim()],
    ['email', email],
    ['nachricht', nachricht]
  ].forEach(function (pair) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = pair[0];
    input.value = pair[1];
    hiddenForm.appendChild(input);
  });

  document.body.appendChild(hiddenForm);
  hiddenForm.submit();
  hiddenForm.remove();

  setTimeout(function () {
    status.textContent = 'Danke! Deine Nachricht wurde gesendet – wir melden uns bald.';
    status.className = 'kontakt-status ok';
    form.reset();
    button.disabled = false;
  }, 1200);
}

document.addEventListener('DOMContentLoaded', initSiteNav);
