/* ============================================================
   Portal Santo Cristo · conteúdo data-driven
   Lê data/atrativos.json e renderiza cards + mapa Leaflet.
   Todos os dados são de primeira parte (arquivos do próprio site).
   ============================================================ */
(function () {
  const SC_CENTER = [-27.8239, -54.6628];

  // Metadados de categoria: ícone Lucide + cor do pin + chave i18n do rótulo
  const CATS = {
    aquatico:   { icon: 'waves',        color: '#1f6f97', label: 'cat_aquatico' },
    hotel:      { icon: 'bed-double',   color: '#1f7a4d', label: 'cat_hotel' },
    religioso:  { icon: 'church',       color: '#7a5a2b', label: 'cat_religioso' },
    cultura:    { icon: 'landmark',     color: '#b5482b', label: 'cat_cultura' },
    natureza:   { icon: 'trees',        color: '#15583b', label: 'cat_natureza' },
    balneario:  { icon: 'tent-tree',    color: '#1f7a6e', label: 'cat_balneario' },
    praca:      { icon: 'flower-2',     color: '#3f9d5a', label: 'cat_praca' },
    bebidas:    { icon: 'beer',         color: '#d99a26', label: 'cat_bebidas' },
    colonial:   { icon: 'grape',        color: '#7a2e4a', label: 'cat_colonial' },
    agro:       { icon: 'milk',         color: '#2f7dc4', label: 'cat_agro' },
    portico:    { icon: 'landmark',     color: '#b07d1e', label: 'cat_portico' },
    porto:      { icon: 'ship',         color: '#15455f', label: 'cat_porto' },
    esporte:    { icon: 'medal',        color: '#b5482b', label: 'cat_esporte' },
    regiao:      { icon: 'mountain-snow', color: '#2f6f5a', label: 'cat_regiao' },
    agroturismo: { icon: 'sprout',        color: '#6a3d9a', label: 'cat_agroturismo' },
  };

  let PLACES = [];
  let activeFilter = 'all';
  let map = null;
  let markerLayer = null;

  function catLabel(cat) {
    const meta = CATS[cat];
    return meta ? window.t(meta.label, cat) : cat;
  }

  function placeName(p) {
    const lang = window.SANTOCRISTO.lang;
    if (lang !== 'pt' && p['nome_' + lang]) return p['nome_' + lang];
    return p.nome;
  }
  function placeDesc(p) {
    const lang = window.SANTOCRISTO.lang;
    if (lang !== 'pt' && p['desc_' + lang]) return p['desc_' + lang];
    return p.desc;
  }

  function makeCard(p) {
    const meta = CATS[p.categoria] || { icon: 'map-pin', color: '#1f7a4d' };
    const card = document.createElement('article');
    card.className = 'card reveal';

    const media = document.createElement('div');
    media.className = 'card-media';
    if (p.img) {
      const im = document.createElement('img');
      im.src = p.img; im.alt = placeName(p); im.loading = 'lazy';
      media.appendChild(im);
    } else {
      const ph = document.createElement('div');
      ph.className = 'ph'; ph.setAttribute('data-ph', placeName(p));
      media.appendChild(ph);
    }
    const tag = document.createElement('span');
    tag.className = 'card-tag';
    tag.innerHTML = '<i data-lucide="' + meta.icon + '"></i>';
    tag.appendChild(document.createTextNode(catLabel(p.categoria)));
    media.appendChild(tag);
    card.appendChild(media);

    const body = document.createElement('div');
    body.className = 'card-body';

    const h = document.createElement('h3');
    h.textContent = placeName(p);
    body.appendChild(h);

    const desc = document.createElement('p');
    desc.textContent = placeDesc(p);
    body.appendChild(desc);

    if (p.local) {
      const meta2 = document.createElement('div');
      meta2.className = 'card-meta';
      meta2.innerHTML = '<i data-lucide="map-pin"></i>';
      meta2.appendChild(document.createTextNode(p.local));
      body.appendChild(meta2);
    }

    if (Array.isArray(p.links) && p.links.length) {
      const links = document.createElement('div');
      links.className = 'card-links';
      p.links.forEach((l) => {
        const a = document.createElement('a');
        a.href = l.url; a.target = '_blank'; a.rel = 'noopener';
        a.innerHTML = '<i data-lucide="' + (l.icon || 'external-link') + '"></i>';
        a.appendChild(document.createTextNode(l.label));
        links.appendChild(a);
      });
      body.appendChild(links);
    }

    card.appendChild(body);
    return card;
  }

  function renderGrid() {
    const grid = document.getElementById('atrativos-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const list = PLACES.filter((p) => activeFilter === 'all' || p.categoria === activeFilter);
    list.forEach((p) => grid.appendChild(makeCard(p)));
    if (window.lucide) lucide.createIcons();
    if (window.__reobserveReveal) window.__reobserveReveal(grid);
  }

  function renderHighlights() {
    const grid = document.getElementById('highlights');
    if (!grid) return;
    grid.innerHTML = '';
    PLACES.filter((p) => p.destaque).slice(0, 6).forEach((p) => grid.appendChild(makeCard(p)));
    if (window.lucide) lucide.createIcons();
    if (window.__reobserveReveal) window.__reobserveReveal(grid);
  }

  function buildFilters() {
    const bar = document.getElementById('filters');
    if (!bar) return;
    const cats = Array.from(new Set(PLACES.map((p) => p.categoria)));
    bar.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.dataset.cat = 'all';
    allBtn.className = 'active';
    allBtn.setAttribute('data-i18n', 'filter_all');
    allBtn.textContent = window.t('filter_all', 'Todos');
    bar.appendChild(allBtn);

    cats.forEach((c) => {
      const b = document.createElement('button');
      b.dataset.cat = c;
      b.textContent = catLabel(c);
      bar.appendChild(b);
    });

    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      activeFilter = btn.dataset.cat;
      bar.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === btn));
      renderGrid();
      drawMarkers();
    });
  }

  function pinIcon(meta) {
    return L.divIcon({
      className: 'map-pin',
      html: '<span style="background:' + meta.color + '"><i data-lucide="' + meta.icon + '"></i></span>',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -28],
    });
  }

  function drawMarkers() {
    if (!map) return;
    if (markerLayer) markerLayer.clearLayers();
    else markerLayer = L.layerGroup().addTo(map);

    const list = PLACES.filter(
      (p) => Array.isArray(p.coords) && (activeFilter === 'all' || p.categoria === activeFilter)
    );
    list.forEach((p) => {
      const meta = CATS[p.categoria] || { icon: 'map-pin', color: '#1f7a4d' };
      const m = L.marker(p.coords, { icon: pinIcon(meta) });
      const safe = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      m.bindPopup('<strong>' + safe(placeName(p)) + '</strong><br>' + safe(p.local || ''));
      markerLayer.addLayer(m);
    });
    if (window.lucide) lucide.createIcons();
  }

  function initMap() {
    const el = document.getElementById('map');
    if (!el || !window.L) return;
    map = L.map('map', { scrollWheelZoom: false }).setView(SC_CENTER, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    drawMarkers();
  }

  async function boot() {
    try {
      const res = await fetch('data/atrativos.json');
      PLACES = await res.json();
    } catch (e) {
      console.error('Falha ao carregar atrativos', e);
      return;
    }
    buildFilters();
    renderGrid();
    renderHighlights();
    initMap();
  }

  document.addEventListener('core-ready', boot);
  document.addEventListener('langchange', () => {
    if (!PLACES.length) return;
    const bar = document.getElementById('filters');
    if (bar) {
      bar.querySelectorAll('button').forEach((b) => {
        b.textContent = b.dataset.cat === 'all' ? window.t('filter_all', 'Todos') : catLabel(b.dataset.cat);
      });
    }
    renderGrid();
    renderHighlights();
    drawMarkers();
  });
})();
