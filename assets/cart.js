const CART_STORAGE_KEY = 'meingameboy-warenkorb-session';

const ShopCart = {
  items: [],
  preise: {},
  bestand: {},
  bestandLoaded: false,
  namen: {},
  toastTimer: null,
  rabattApplied: false,

  init: function () {
    try {
      localStorage.removeItem('meingameboy-warenkorb-v1');
    } catch (error) { /* ignore */ }
    this.load();
    this.ensureToast();
    this.bindUi();
    this.renderBadge();
    if (typeof SITE_API_URL !== 'undefined' && SITE_API_URL) {
      this.fetchShopData();
    }
  },

  storage: function () {
    try {
      return sessionStorage;
    } catch (error) {
      return null;
    }
  },

  load: function () {
    try {
      const store = this.storage();
      const raw = store ? store.getItem(CART_STORAGE_KEY) : null;
      this.items = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(this.items)) this.items = [];
    } catch (error) {
      this.items = [];
    }
  },

  save: function () {
    try {
      const store = this.storage();
      if (store) {
        store.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
      }
    } catch (error) { /* ignore */ }
    this.renderBadge();
    this.renderModal();
  },

  syncBestand: function (data) {
    if (!data) return;
    this.bestand = Object.assign({}, data);
    this.bestandLoaded = true;
    this.enforceStockLimits();
  },

  fetchShopData: function () {
    const self = this;
    fetch(SITE_API_URL + '?t=' + Date.now())
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.preise) self.preise = data.preise;
        if (data.bestand) self.syncBestand(data.bestand);
        if (typeof window.applyShopPreise === 'function') {
          window.applyShopPreise(data.preise || {}, data.bestand || {});
        }
      })
      .catch(function () { /* Fallback bleibt HTML-Preise */ });
  },

  getBestandFromDom: function (produktId) {
    const produkt = document.querySelector('.produkt[data-produkt-id="' + produktId + '"]');
    if (produkt && produkt.dataset.bestand != null) {
      return Math.max(0, parseInt(produkt.dataset.bestand, 10) || 0);
    }
    if (typeof window.getShopBestand === 'function') {
      const qty = window.getShopBestand(produktId);
      if (qty != null) return Math.max(0, Number(qty) || 0);
    }
    return null;
  },

  getBestand: function (produktId) {
    const dom = this.getBestandFromDom(produktId);
    if (dom != null) return dom;
    if (Object.prototype.hasOwnProperty.call(this.bestand, produktId)) {
      return Math.max(0, Number(this.bestand[produktId]) || 0);
    }
    return null;
  },

  getMaxQty: function (produktId) {
    const stock = this.getBestand(produktId);
    if (stock != null) return stock;
    return this.bestandLoaded ? 0 : 1;
  },

  getCartQty: function (produktId) {
    const item = this.items.find(function (entry) { return entry.produktId === produktId; });
    return item ? item.qty : 0;
  },

  enforceStockLimits: function () {
    let changed = false;

    this.items.forEach(function (item) {
      const max = ShopCart.getMaxQty(item.produktId);
      if (max <= 0) {
        changed = true;
        return;
      }
      if (item.qty > max) {
        item.qty = max;
        changed = true;
      }
    });

    const filtered = this.items.filter(function (item) {
      return ShopCart.getMaxQty(item.produktId) > 0;
    });

    if (filtered.length !== this.items.length) {
      this.items = filtered;
      changed = true;
    }

    if (changed) {
      try {
        const store = ShopCart.storage();
        if (store) store.setItem(CART_STORAGE_KEY, JSON.stringify(ShopCart.items));
      } catch (error) { /* ignore */ }
      ShopCart.renderBadge();
    }
  },

  getPreis: function (produktId) {
    if (this.preise[produktId] != null) return Number(this.preise[produktId]);
    const block = document.querySelector('.produkt[data-produkt-id="' + produktId + '"] .preis-block');
    if (block && block.dataset.preis) return parseFloat(block.dataset.preis);
    const variant = document.querySelector('.produkt.spiel-variante[data-spiel]');
    if (variant && variant.dataset.produktId === produktId && variant.querySelector('.preis-block')) {
      return parseFloat(variant.querySelector('.preis-block').dataset.preis);
    }
    const item = this.items.find(function (entry) { return entry.produktId === produktId; });
    return item ? item.preis : 0;
  },

  ensureToast: function () {
    if (document.getElementById('cart-toast')) return;
    document.body.insertAdjacentHTML(
      'beforeend',
      '<p class="cart-toast" id="cart-toast" hidden role="status" aria-live="polite"></p>'
    );
  },

  notify: function (text, isError) {
    this.ensureToast();
    const toast = document.getElementById('cart-toast');
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    toast.classList.toggle('cart-toast--error', !!isError);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(function () {
      toast.hidden = true;
    }, 4000);
  },

  add: function (produktId, name, preis) {
    const max = this.getMaxQty(produktId);
    const current = this.getCartQty(produktId);

    if (max <= 0) {
      this.notify('Dieser Artikel ist leider ausverkauft.', true);
      return false;
    }

    if (current >= max) {
      this.notify(
        max === 1
          ? 'Nur 1 Stück verfügbar – liegt schon im Warenkorb.'
          : 'Maximal ' + max + ' Stück verfügbar – mehr geht nicht.',
        true
      );
      return false;
    }

    const existing = this.items.find(function (item) { return item.produktId === produktId; });
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({
        produktId: produktId,
        name: name,
        preis: preis,
        qty: 1
      });
    }
    this.save();
    this.notify('„' + name + '“ liegt im Warenkorb.');
    return true;
  },

  remove: function (produktId) {
    this.items = this.items.filter(function (item) { return item.produktId !== produktId; });
    this.rabattApplied = false;
    this.save();
  },

  setQty: function (produktId, qty) {
    const item = this.items.find(function (entry) { return entry.produktId === produktId; });
    if (!item) return;

    const max = this.getMaxQty(produktId);
    const requested = parseInt(qty, 10) || 1;
    const next = Math.max(1, Math.min(requested, max));

    if (requested > max && max > 0) {
      this.notify('Nur noch ' + max + ' Stück verfügbar.', true);
    }

    item.qty = next;
    this.rabattApplied = false;
    this.save();
  },

  clear: function () {
    this.items = [];
    this.rabattApplied = false;
    this.save();
  },

  count: function () {
    return this.items.reduce(function (sum, item) { return sum + item.qty; }, 0);
  },

  subtotal: function () {
    return this.items.reduce(function (sum, item) {
      const preis = ShopCart.getPreis(item.produktId) || item.preis || 0;
      return sum + preis * item.qty;
    }, 0);
  },

  cartPayload: function () {
    return this.items.map(function (item) {
      return { produktId: item.produktId, qty: item.qty };
    });
  },

  renderBadge: function () {
    const badge = document.getElementById('warenkorb-badge');
    if (!badge) return;
    const count = this.count();
    badge.textContent = String(count);
    badge.hidden = count <= 0;
  },

  bindUi: function () {
    const openBtn = document.getElementById('warenkorb-open');
    const closeBtn = document.getElementById('warenkorb-close');
    const modal = document.getElementById('warenkorb-modal');
    const checkoutBtn = document.getElementById('warenkorb-checkout');
    const rabattCheckBtn = document.getElementById('warenkorb-rabatt-check');
    const rabattInput = document.getElementById('warenkorb-rabatt');

    if (openBtn) openBtn.addEventListener('click', this.openModal.bind(this));
    if (closeBtn) closeBtn.addEventListener('click', this.closeModal.bind(this));
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target.id === 'warenkorb-modal') ShopCart.closeModal();
      });
    }
    if (checkoutBtn) checkoutBtn.addEventListener('click', this.checkout.bind(this));
    if (rabattCheckBtn) rabattCheckBtn.addEventListener('click', this.confirmRabatt.bind(this));
    if (rabattInput) {
      rabattInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          ShopCart.confirmRabatt();
        }
      });
      rabattInput.addEventListener('input', function () {
        ShopCart.rabattApplied = false;
        ShopCart.resetRabattDisplay();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') ShopCart.closeModal();
    });
  },

  openModal: function () {
    const modal = document.getElementById('warenkorb-modal');
    if (!modal) return;
    this.renderModal();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  },

  closeModal: function () {
    const modal = document.getElementById('warenkorb-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  },

  resetRabattDisplay: function () {
    const rabattZeile = document.getElementById('warenkorb-rabatt-zeile');
    const rabattHinweisEl = document.getElementById('warenkorb-rabatt-hinweis');
    const endpreisEl = document.getElementById('warenkorb-endpreis');
    const subtotal = this.subtotal();

    if (rabattZeile) rabattZeile.hidden = true;
    if (endpreisEl) endpreisEl.textContent = formatCartPreis(subtotal);
    if (rabattHinweisEl) {
      rabattHinweisEl.textContent = 'Code eingeben und auf „Code prüfen“ klicken.';
      rabattHinweisEl.className = 'warenkorb-rabatt-hinweis';
    }
    this.updateLocalTotals();
  },

  updateLocalTotals: function () {
    const subtotalEl = document.getElementById('warenkorb-zwischensumme');
    const endpreisEl = document.getElementById('warenkorb-endpreis');
    const subtotal = this.subtotal();

    if (subtotalEl) subtotalEl.textContent = formatCartPreis(subtotal);
    if (endpreisEl && !this.rabattApplied) {
      endpreisEl.textContent = formatCartPreis(subtotal);
    }
  },

  applyQuote: function (data) {
    const subtotalEl = document.getElementById('warenkorb-zwischensumme');
    const endpreisEl = document.getElementById('warenkorb-endpreis');
    const rabattZeile = document.getElementById('warenkorb-rabatt-zeile');
    const rabattBetragEl = document.getElementById('warenkorb-rabatt-betrag');
    const rabattProzentEl = document.getElementById('warenkorb-rabatt-prozent');
    const rabattHinweisEl = document.getElementById('warenkorb-rabatt-hinweis');
    const checkBtn = document.getElementById('warenkorb-rabatt-check');

    if (checkBtn) {
      checkBtn.disabled = false;
      checkBtn.textContent = 'Code prüfen';
    }

    if (!data.ok) {
      this.rabattApplied = false;
      this.updateLocalTotals();
      if (rabattHinweisEl) {
        rabattHinweisEl.textContent = data.error || 'Code konnte nicht geprüft werden.';
        rabattHinweisEl.className = 'warenkorb-rabatt-hinweis is-error';
      }
      if (rabattZeile) rabattZeile.hidden = true;
      return;
    }

    this.rabattApplied = true;

    if (subtotalEl) subtotalEl.textContent = formatCartPreis(data.subtotal);
    if (endpreisEl) endpreisEl.textContent = formatCartPreis(data.total);

    if (rabattZeile && rabattBetragEl) {
      if (data.discount > 0) {
        rabattZeile.hidden = false;
        let prozent = data.rabattProzent;
        if (prozent == null && data.subtotal > 0) {
          prozent = Math.round(data.discount / data.subtotal * 100);
        }
        if (rabattProzentEl) {
          rabattProzentEl.textContent = prozent != null ? prozent + ' %' : 'Festbetrag';
        }
        rabattBetragEl.textContent = '−' + Number(data.discount).toFixed(2).replace('.', ',') + ' €';
      } else {
        rabattZeile.hidden = true;
      }
    }

    if (rabattHinweisEl) {
      if (data.rabattHinweis) {
        rabattHinweisEl.textContent = data.rabattHinweis;
      } else {
        rabattHinweisEl.textContent = 'Kein Rabatt – du zahlst den normalen Preis.';
      }
      rabattHinweisEl.className = 'warenkorb-rabatt-hinweis';
      if (data.rabattGueltig === true) rabattHinweisEl.classList.add('is-ok');
      if (data.rabattGueltig === false) rabattHinweisEl.classList.add('is-error');
    }
  },

  confirmRabatt: function () {
    if (this.items.length === 0) return;

    const rabattInput = document.getElementById('warenkorb-rabatt');
    const checkBtn = document.getElementById('warenkorb-rabatt-check');
    const code = rabattInput ? rabattInput.value.trim() : '';

    if (!code) {
      this.resetRabattDisplay();
      const hinweis = document.getElementById('warenkorb-rabatt-hinweis');
      if (hinweis) {
        hinweis.textContent = 'Bitte zuerst einen Code eingeben.';
        hinweis.className = 'warenkorb-rabatt-hinweis is-error';
      }
      return;
    }

    if (!SITE_API_URL) {
      this.notify('Code-Prüfung derzeit nicht verfügbar.', true);
      return;
    }

    if (checkBtn) {
      checkBtn.disabled = true;
      checkBtn.textContent = 'Prüfe …';
    }

    const params = new URLSearchParams({
      action: 'quote',
      cart: JSON.stringify(this.cartPayload()),
      rabatt: code
    });

    fetch(SITE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
      .then(function (response) { return response.json(); })
      .then(this.applyQuote.bind(this))
      .catch(function () {
        ShopCart.rabattApplied = false;
        if (checkBtn) {
          checkBtn.disabled = false;
          checkBtn.textContent = 'Code prüfen';
        }
        const hinweis = document.getElementById('warenkorb-rabatt-hinweis');
        if (hinweis) {
          hinweis.textContent = 'Verbindungsfehler – bitte später erneut versuchen.';
          hinweis.className = 'warenkorb-rabatt-hinweis is-error';
        }
      });
  },

  renderModal: function () {
    const list = document.getElementById('warenkorb-liste');
    const empty = document.getElementById('warenkorb-leer');
    const summary = document.getElementById('warenkorb-summary');
    if (!list || !empty || !summary) return;

    list.innerHTML = '';
    if (this.items.length === 0) {
      empty.hidden = false;
      summary.hidden = true;
      this.rabattApplied = false;
      return;
    }

    empty.hidden = true;
    summary.hidden = false;
    this.rabattApplied = false;

    this.items.forEach(function (item) {
      const preis = ShopCart.getPreis(item.produktId) || item.preis || 0;
      const maxQty = ShopCart.getMaxQty(item.produktId);
      const stockHint = maxQty > 0 && maxQty < 99 ? ' · max. ' + maxQty + ' verfügbar' : '';
      const li = document.createElement('li');
      li.className = 'warenkorb-item';
      li.innerHTML =
        '<div class="warenkorb-item-info">' +
          '<strong>' + escapeHtml(item.name) + '</strong>' +
          '<span>' + formatCartPreis(preis) + ' · Summe ' + formatCartPreis(preis * item.qty) + stockHint + '</span>' +
        '</div>' +
        '<div class="warenkorb-item-actions">' +
          '<label class="warenkorb-qty">Anz.' +
            '<input type="number" min="1" max="' + Math.max(1, maxQty) + '" value="' + item.qty + '" data-qty-id="' + item.produktId + '">' +
          '</label>' +
          '<button type="button" class="warenkorb-remove" data-remove-id="' + item.produktId + '" aria-label="Entfernen">&times;</button>' +
        '</div>';
      list.appendChild(li);
    });

    list.querySelectorAll('[data-remove-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ShopCart.remove(btn.getAttribute('data-remove-id'));
      });
    });

    list.querySelectorAll('[data-qty-id]').forEach(function (input) {
      input.addEventListener('change', function () {
        ShopCart.setQty(input.getAttribute('data-qty-id'), parseInt(input.value, 10) || 1);
      });
    });

    this.resetRabattDisplay();
  },

  checkout: function () {
    const rabattInput = document.getElementById('warenkorb-rabatt');
    const button = document.getElementById('warenkorb-checkout');
    const code = rabattInput ? rabattInput.value.trim() : '';

    if (this.items.length === 0) {
      this.notify('Dein Warenkorb ist leer.', true);
      return;
    }

    if (code && !this.rabattApplied) {
      this.notify('Bitte zuerst „Code prüfen“ klicken.', true);
      return;
    }

    if (!SITE_API_URL) {
      this.notify('Checkout derzeit nicht verfügbar.', true);
      return;
    }

    button.disabled = true;
    this.notify('Wird vorbereitet …');

    const params = new URLSearchParams({
      action: 'checkout',
      cart: JSON.stringify(this.cartPayload()),
      rabatt: code
    });

    fetch(SITE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.ok && data.paypalUrl) {
          window.location.href = data.paypalUrl;
          return;
        }
        ShopCart.notify(data.error || 'Checkout fehlgeschlagen.', true);
        if (data.rabattHinweis || data.subtotal != null) {
          ShopCart.applyQuote(data);
        }
        button.disabled = false;
      })
      .catch(function () {
        ShopCart.notify('Verbindungsfehler. Bitte später erneut versuchen.', true);
        button.disabled = false;
      });
  }
};

function formatCartPreis(value) {
  return Number(value).toFixed(2).replace('.', ',') + ' €';
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', function () {
  ShopCart.init();
});
