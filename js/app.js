/* ============================================================
   Portal Santo Cristo — core: partials, i18n, nav, reveal
   ============================================================ */
window.SANTOCRISTO = window.SANTOCRISTO || { lang: 'pt', t: {} };
const SUPPORTED_LANGS = ['pt', 'es', 'en'];

function refreshIcons() {
  if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

async function injectPartial(id, url) {
  const slot = document.getElementById(id);
  if (!slot) return;
  try {
    const res = await fetch(url);
    slot.innerHTML = await res.text();
  } catch (e) {
    console.error('Falha ao carregar', url, e);
  }
}

/* ---- i18n ---- */
function detectLang() {
  const saved = localStorage.getItem('santocristo-lang');
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  const nav = (navigator.language || 'pt').slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(nav) ? nav : 'pt';
}

async function loadLang(lang) {
  let dict = {};
  try {
    const res = await fetch(`i18n/ui.${lang}.json`);
    dict = await res.json();
  } catch (e) {
    console.warn('i18n indisponível para', lang, e);
  }
  window.SANTOCRISTO.lang = lang;
  window.SANTOCRISTO.t = dict;
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
  localStorage.setItem('santocristo-lang', lang);
  applyTranslations(dict);
  updateLangSwitch(lang);
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang, dict } }));
}

function applyTranslations(dict) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] != null) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key] != null) el.innerHTML = dict[key];
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.getAttribute('data-i18n-attr').split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (dict[key] != null) el.setAttribute(attr, dict[key]);
    });
  });
}

function updateLangSwitch(lang) {
  document.querySelectorAll('.lang-switch button').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
}

/* Translation lookup usable by other scripts */
window.t = (key, fallback) =>
  (window.SANTOCRISTO.t[key] != null ? window.SANTOCRISTO.t[key] : (fallback || key));

/* ---- Header behaviour ---- */
function initHeaderBehaviour() {
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById('burger');
  const mnav = document.getElementById('mobileNav');
  if (burger && mnav) {
    burger.addEventListener('click', () => {
      const open = mnav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    mnav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        mnav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // Active nav highlight
  const page = (location.pathname.split('/').pop() || 'index.html');
  const current = page === '' ? 'index.html' : page;
  document.querySelectorAll('.nav a, .mobile-nav a').forEach((a) => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });

  document.querySelectorAll('.lang-switch button').forEach((b) =>
    b.addEventListener('click', () => loadLang(b.dataset.lang))
  );

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

/* ---- Reveal on scroll ---- */
let _revealObserver = null;
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in'));
    window.__reobserveReveal = (root) =>
      (root || document).querySelectorAll('.reveal').forEach((e) => e.classList.add('in'));
    return;
  }
  _revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(() => el.classList.add('in'), delay);
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((e) => _revealObserver.observe(e));
  window.__reobserveReveal = (root) =>
    (root || document).querySelectorAll('.reveal:not(.in)').forEach((e) => _revealObserver.observe(e));
}

/* ---- Boot ---- */
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    injectPartial('header-slot', 'components/header.html'),
    injectPartial('footer-slot', 'components/footer.html'),
  ]);
  initHeaderBehaviour();
  await loadLang(detectLang());
  refreshIcons();
  initReveal();
  document.dispatchEvent(new CustomEvent('core-ready', { detail: { lang: window.SANTOCRISTO.lang } }));
});
