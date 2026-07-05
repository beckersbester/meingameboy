// Run in browser CDP on eBay item page
(() => {
  const t = document.documentElement.innerHTML;
  const title = document.querySelector('h1')?.textContent?.trim() || '';
  const idx = t.indexOf('menuItemMap');
  const chunk = idx >= 0 ? t.substring(idx, idx + 4000) : '';
  const map = {};
  const re = /"(\d+)":\{"valueId":(\d),"valueName":"([^"]+)"[^}]+matchingVariationIds":\[(\d+)\][^}]*outOfStock":(true|false)/g;
  let m;
  while ((m = re.exec(chunk)) !== null) {
    map[m[3]] = { varId: m[4], outOfStock: m[5] === 'true' };
  }
  const prices = {};
  const qty = {};
  const re2 = /"(\d{12,})":\{"binModel":\{"price":\{"_type":"TextualDisplayValue","value":\{"value":([0-9.]+)/g;
  while ((m = re2.exec(t)) !== null) prices[m[1]] = m[2];
  const re3 = new RegExp('"(\d{12,})":\\{"binModel"[\\s\\S]{0,800}?"quantity":\\{"_type":"QuantityViewModel"[\\s\\S]{0,400}?"maxQuantity":(\\d+)', 'g');
  while ((m = re3.exec(t)) !== null) qty[m[1]] = parseInt(m[2], 10);
  const condToZ = { 'Akzeptabel': 'z1', 'Gut': 'z2', 'Sehr Gut': 'z3', 'Neuwertig': 'z4' };
  const variants = {};
  Object.keys(map).forEach(function (name) {
    const z = condToZ[name];
    if (!z) return;
    const id = map[name].varId;
    variants[z] = {
      label: name,
      price: prices[id] ? parseFloat(prices[id]) : null,
      stock: map[name].outOfStock ? 0 : (qty[id] != null ? qty[id] : 1)
    };
  });
  const imgs = [...document.querySelectorAll('.ux-image-carousel-item img, .ux-image-grid-item img, .ux-image-carousel img')].map(function (img) {
    return img.src || img.getAttribute('data-src') || '';
  }).filter(Boolean);
  const mainImg = document.querySelector('.ux-image-carousel-item img')?.src || imgs[0] || '';
  return JSON.stringify({ title, variants, mainImg, imgs: imgs.slice(0, 8) });
})();
