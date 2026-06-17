/* ============================================================
   Portal Santo Cristo · página de Destaques do Noroeste Gaúcho
   Lê data/destaques.json: bloco "icones" (fotos CC) e bloco
   "sabores" (embeds sociais lazy-loaded). Sem dependências de
   terceiros até o usuário rolar até um embed.
   ============================================================ */
(function () {
  let ITEMS = [];
  let igLoaded = false;
  let fbLoaded = false;
  let embedObserver = null;

  function lang() { return window.SANTOCRISTO.lang; }
  function field(p, base) {
    const l = lang();
    return (l !== 'pt' && p[base + '_' + l]) ? p[base + '_' + l] : p[base];
  }
  function name(p) { return field(p, 'nome'); }
  function desc(p) { return field(p, 'desc'); }

  function linkButtons(p) {
    if (!Array.isArray(p.links) || !p.links.length) return null;
    const wrap = document.createElement('div');
    wrap.className = 'card-links';
    p.links.forEach((l) => {
      const a = document.createElement('a');
      a.href = l.url; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = '<i data-lucide="' + (l.icon || 'external-link') + '"></i>';
      a.appendChild(document.createTextNode(l.label));
      wrap.appendChild(a);
    });
    return wrap;
  }

  /* ---- Bloco "icones": cards com foto CC ---- */
  function iconCard(p) {
    const card = document.createElement('article');
    card.className = 'card reveal';

    const media = document.createElement('div');
    media.className = 'card-media';
    if (p.img) {
      const im = document.createElement('img');
      im.src = p.img; im.alt = name(p); im.loading = 'lazy';
      media.appendChild(im);
    } else {
      const ph = document.createElement('div');
      ph.className = 'ph'; ph.setAttribute('data-ph', name(p));
      media.appendChild(ph);
    }
    card.appendChild(media);

    const body = document.createElement('div');
    body.className = 'card-body';
    const h = document.createElement('h3'); h.textContent = name(p); body.appendChild(h);
    const d = document.createElement('p'); d.textContent = desc(p); body.appendChild(d);
    if (p.cidade) {
      const m = document.createElement('div');
      m.className = 'card-meta';
      m.innerHTML = '<i data-lucide="map-pin"></i>';
      m.appendChild(document.createTextNode(p.cidade));
      body.appendChild(m);
    }
    const lb = linkButtons(p); if (lb) body.appendChild(lb);
    card.appendChild(body);
    return card;
  }

  /* ---- Bloco "sabores": blocos editoriais alternados ---- */
  function embedNode(em) {
    if (em.type === 'instagram') {
      const bq = document.createElement('blockquote');
      bq.className = 'instagram-media';
      bq.setAttribute('data-instgrm-permalink', em.url);
      bq.setAttribute('data-instgrm-version', '14');
      bq.style.margin = '0';
      const a = document.createElement('a'); a.href = em.url; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Instagram';
      bq.appendChild(a);
      return bq;
    }
    if (em.type === 'facebook') {
      const div = document.createElement('div');
      div.className = 'fb-video';
      div.setAttribute('data-href', em.url);
      div.setAttribute('data-width', '500');
      return div;
    }
    return null;
  }

  function flavorBlock(p, index) {
    const row = document.createElement('div');
    row.className = 'destaque-row reveal' + (index % 2 ? ' destaque-row--rev' : '');

    const text = document.createElement('div');
    text.className = 'destaque-text';
    const h = document.createElement('h3'); h.textContent = name(p); text.appendChild(h);
    if (p.cidade) {
      const m = document.createElement('div');
      m.className = 'card-meta';
      m.innerHTML = '<i data-lucide="map-pin"></i>';
      m.appendChild(document.createTextNode(p.cidade));
      text.appendChild(m);
    }
    const d = document.createElement('p'); d.textContent = desc(p); text.appendChild(d);
    const lb = linkButtons(p); if (lb) text.appendChild(lb);

    const media = document.createElement('div');
    media.className = 'destaque-media';
    if (Array.isArray(p.embeds) && p.embeds.length) {
      p.embeds.forEach((em) => {
        const n = embedNode(em);
        if (n) { media.appendChild(n); media.dataset.hasEmbed = '1'; }
      });
    } else {
      // Cartão social: ícone grande + botões (já em links)
      const sc = document.createElement('div');
      sc.className = 'social-card';
      const icon = (p.links && p.links[0] && p.links[0].icon) || 'image';
      sc.innerHTML = '<i data-lucide="' + icon + '"></i>';
      const span = document.createElement('span'); span.textContent = name(p);
      sc.appendChild(span);
      media.appendChild(sc);
    }

    row.appendChild(text);
    row.appendChild(media);
    return row;
  }

  /* ---- Lazy-load dos scripts de embed ---- */
  function loadInstagram() {
    if (igLoaded) { if (window.instgrm) window.instgrm.Embeds.process(); return; }
    igLoaded = true;
    const s = document.createElement('script');
    s.src = 'https://www.instagram.com/embed.js'; s.async = true;
    s.onload = () => { if (window.instgrm) window.instgrm.Embeds.process(); };
    document.body.appendChild(s);
  }
  function loadFacebook() {
    if (fbLoaded) { if (window.FB) window.FB.XFBML.parse(); return; }
    fbLoaded = true;
    if (!document.getElementById('fb-root')) {
      const r = document.createElement('div'); r.id = 'fb-root'; document.body.appendChild(r);
    }
    const s = document.createElement('script');
    s.src = 'https://connect.facebook.net/pt_BR/sdk.js#xfbml=1&version=v19.0';
    s.async = true; s.defer = true; s.crossOrigin = 'anonymous';
    document.body.appendChild(s);
  }
  function observeEmbeds() {
    if (!('IntersectionObserver' in window)) { loadInstagram(); loadFacebook(); return; }
    if (embedObserver) embedObserver.disconnect();
    embedObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        if (e.target.querySelector('.instagram-media')) loadInstagram();
        if (e.target.querySelector('.fb-video')) loadFacebook();
        obs.unobserve(e.target);
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('.destaque-media[data-has-embed]').forEach((m) => embedObserver.observe(m));
  }

  function renderCredits() {
    const ul = document.getElementById('destaques-credits');
    if (!ul) return;
    ul.innerHTML = '';
    ITEMS.filter((p) => p.img && p.credito).forEach((p) => {
      const li = document.createElement('li');
      li.textContent = name(p) + ' · ' + p.credito;
      ul.appendChild(li);
    });
  }

  function render() {
    const icons = document.getElementById('destaques-icones');
    const flavors = document.getElementById('destaques-sabores');
    if (!icons || !flavors) return;
    icons.innerHTML = ''; flavors.innerHTML = '';
    let fi = 0;
    ITEMS.forEach((p) => {
      if (p.bloco === 'icones') icons.appendChild(iconCard(p));
      else flavors.appendChild(flavorBlock(p, fi++));
    });
    renderCredits();
    if (window.lucide) lucide.createIcons();
    if (window.__reobserveReveal) { window.__reobserveReveal(icons); window.__reobserveReveal(flavors); }
    observeEmbeds();
  }

  async function boot() {
    try {
      ITEMS = await (await fetch('data/destaques.json')).json();
    } catch (e) { console.error('Falha ao carregar destaques', e); return; }
    render();
  }

  document.addEventListener('core-ready', boot);
  document.addEventListener('langchange', () => { if (ITEMS.length) render(); });
})();
