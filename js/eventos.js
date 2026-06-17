/* ============================================================
   Portal Santo Cristo · página de Eventos & Agenda
   Lê data/eventos.json: "destaque" (evento marquee, ex. Carnaval),
   "anuais" (cards dos grandes eventos do ano) e "agenda"
   (lista enxuta de datas de 2026). Textos trilíngues via campos
   _es / _en, re-renderizados em troca de idioma.
   ============================================================ */
(function () {
  let DATA = null;

  function lang() { return window.SANTOCRISTO.lang; }
  function field(p, base) {
    const l = lang();
    return (l !== 'pt' && p[base + '_' + l]) ? p[base + '_' + l] : p[base];
  }

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

  function mediaNode(p, klass) {
    const media = document.createElement('div');
    media.className = klass;
    if (p.img) {
      const im = document.createElement('img');
      im.src = p.img; im.alt = field(p, 'nome'); im.loading = 'lazy';
      media.appendChild(im);
    } else {
      const ph = document.createElement('div');
      ph.className = 'ph'; ph.setAttribute('data-ph', field(p, 'ph') || field(p, 'nome'));
      media.appendChild(ph);
    }
    return media;
  }

  /* ---- Evento em destaque (marquee, ex. Carnaval, Oktoberfest) ---- */
  function featureNode(p, index) {
    const wrap = document.createElement('article');
    wrap.className = 'feature reveal' + (index % 2 ? ' rev' : '');
    wrap.appendChild(mediaNode(p, 'feature-media'));

    const body = document.createElement('div');
    body.className = 'feature-body';
    const eyebrow = document.createElement('span');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = field(p, 'tag') + ' · ' + field(p, 'quando');
    body.appendChild(eyebrow);
    const h = document.createElement('h3'); h.textContent = field(p, 'nome'); body.appendChild(h);
    const d = document.createElement('p'); d.textContent = field(p, 'desc'); body.appendChild(d);
    const lb = linkButtons(p); if (lb) body.appendChild(lb);
    wrap.appendChild(body);
    return wrap;
  }

  /* ---- Cards dos grandes eventos anuais ---- */
  function eventCard(p) {
    const card = document.createElement('article');
    card.className = 'card reveal';

    const media = mediaNode(p, 'card-media');
    const tag = document.createElement('span');
    tag.className = 'card-tag';
    tag.innerHTML = '<i data-lucide="' + (p.icon || 'calendar-days') + '"></i>';
    tag.appendChild(document.createTextNode(field(p, 'tag')));
    media.appendChild(tag);
    card.appendChild(media);

    const body = document.createElement('div');
    body.className = 'card-body';
    const h = document.createElement('h3'); h.textContent = field(p, 'nome'); body.appendChild(h);
    const d = document.createElement('p'); d.textContent = field(p, 'desc'); body.appendChild(d);
    const m = document.createElement('div');
    m.className = 'card-meta';
    m.innerHTML = '<i data-lucide="calendar"></i>';
    m.appendChild(document.createTextNode(field(p, 'quando')));
    body.appendChild(m);
    card.appendChild(body);
    return card;
  }

  /* ---- Agenda enxuta de 2026 ---- */
  function agendaItem(p) {
    const li = document.createElement('li');
    const when = document.createElement('span');
    when.className = 'when'; when.textContent = field(p, 'quando');
    const what = document.createElement('div');
    what.className = 'what'; what.textContent = field(p, 'o_que');
    const where = field(p, 'onde');
    if (where) {
      const w = document.createElement('span');
      w.className = 'where';
      w.innerHTML = '<i data-lucide="map-pin"></i>';
      w.appendChild(document.createTextNode(' ' + where));
      what.appendChild(w);
    }
    li.appendChild(when); li.appendChild(what);
    return li;
  }

  function render() {
    if (!DATA) return;
    const feat = document.getElementById('evento-destaque');
    const anuais = document.getElementById('eventos-anuais');
    const agenda = document.getElementById('eventos-agenda');
    if (!feat || !anuais || !agenda) return;

    feat.innerHTML = '';
    const destaques = Array.isArray(DATA.destaques)
      ? DATA.destaques
      : (DATA.destaque ? [DATA.destaque] : []);
    destaques.forEach((p, i) => feat.appendChild(featureNode(p, i)));

    anuais.innerHTML = '';
    (DATA.anuais || []).forEach((p) => anuais.appendChild(eventCard(p)));

    agenda.innerHTML = '';
    (DATA.agenda || []).forEach((p) => agenda.appendChild(agendaItem(p)));

    if (window.lucide) lucide.createIcons();
    if (window.__reobserveReveal) {
      window.__reobserveReveal(feat);
      window.__reobserveReveal(anuais);
    }
  }

  async function boot() {
    try {
      DATA = await (await fetch('data/eventos.json')).json();
    } catch (e) { console.error('Falha ao carregar eventos', e); return; }
    render();
  }

  document.addEventListener('core-ready', boot);
  document.addEventListener('langchange', () => { if (DATA) render(); });
})();
