// Language switch (English / German). The English text in the page is the key; see i18n-data.js.
(function () {
  const DE = window.I18N_DE || {}, RULES = window.I18N_RULES || [], root = document.documentElement;
  const ATTRS = ['aria-label', 'title', 'alt', 'placeholder', 'content'];
  const textRec = new WeakMap(), attrRec = new WeakMap();
  let lang = root.getAttribute('data-lang') === 'de' ? 'de' : 'en', busy = false;

  function tr(s) {
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), core = m[2];
    if (!core) return s;
    let out = DE[core];
    if (out == null) for (const [re, fn] of RULES) { const r = re.exec(core); if (r) { out = fn(r); break; } }
    return out == null ? s : m[1] + out + m[3];
  }
  const skip = n => { for (let e = n.nodeType === 1 ? n : n.parentElement; e; e = e.parentElement) { if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(e.tagName) || e.hasAttribute('data-no-i18n')) return true; } return false; };

  function text(n) {
    const v = n.nodeValue, rec = textRec.get(n);
    if (lang === 'de') { if (rec && v === rec.de) return; if (skip(n)) return; const d = tr(v); if (d !== v) { textRec.set(n, { en: v, de: d }); n.nodeValue = d; } else textRec.delete(n); }
    else if (rec) { if (v === rec.de) n.nodeValue = rec.en; textRec.delete(n); }
  }
  function attr(el, a) {
    if (!el.hasAttribute(a) || (a === 'content' && !(el.name === 'description' || el.getAttribute('property') === 'og:description' || el.name === 'twitter:description'))) return;
    let rec = attrRec.get(el); if (!rec) attrRec.set(el, rec = {});
    const v = el.getAttribute(a), r = rec[a];
    if (lang === 'de') { if (r && v === r.de) return; if (skip(el)) return; const d = tr(v); if (d !== v) { rec[a] = { en: v, de: d }; el.setAttribute(a, d); } else delete rec[a]; }
    else if (r) { if (v === r.de) el.setAttribute(a, r.en); delete rec[a]; }
  }
  function walk(node) {
    if (node.nodeType === 3) return text(node);
    if (node.nodeType !== 1) return;
    if (node.nodeType === 1 && /^(SCRIPT|STYLE)$/.test(node.tagName)) return;
    ATTRS.forEach(a => attr(node, a));
    for (let c = node.firstChild; c; c = c.nextSibling) walk(c);
  }
  const mo = new MutationObserver(ms => {
    if (busy) return; busy = true;
    ms.forEach(m => { if (m.type === 'childList') m.addedNodes.forEach(walk); else if (m.type === 'characterData') text(m.target); else if (m.type === 'attributes') attr(m.target, m.attributeName); });
    busy = false; mo.takeRecords();
  });
  const titleEl = document.querySelector('title');
  function apply(l) {
    lang = l; root.setAttribute('data-lang', l); root.lang = l; busy = true;
    walk(document.head); walk(document.body); busy = false; mo.takeRecords();
    const b = document.getElementById('lang-toggle');
    if (b) { b.textContent = l === 'de' ? 'EN' : 'DE'; b.setAttribute('aria-label', l === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'); b.title = b.getAttribute('aria-label'); b.lang = l === 'de' ? 'en' : 'de'; }
  }
  mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  document.addEventListener('DOMContentLoaded', () => { const b = document.getElementById('lang-toggle'); if (b) b.addEventListener('click', () => { const n = lang === 'de' ? 'en' : 'de'; apply(n); try { localStorage.setItem('cp-lang', n); } catch (e) {} }); apply(lang); });
  window.cpLang = { get: () => lang, set: apply };
})();
