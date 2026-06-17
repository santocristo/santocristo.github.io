/* ============================================================
   Portal Santo Cristo · diretório de hospedagem e gastronomia
   Lê data/servicos.json e renderiza listas com endereço, telefone
   e link para o Google Maps de cada estabelecimento. Fonte: página
   de Informações Turísticas da Prefeitura de Santo Cristo.
   ============================================================ */
(function () {
  // Tipo do estabelecimento: ícone Lucide + chave de rótulo i18n
  const KINDS = {
    hotel:        { icon: 'bed-double',     label: 'svc_hotel' },
    pousada:      { icon: 'bed-double',     label: 'svc_pousada' },
    chale:        { icon: 'home',           label: 'svc_chale' },
    fazenda:      { icon: 'trees',          label: 'svc_fazenda' },
    sitio:        { icon: 'tractor',        label: 'svc_sitio' },
    restaurante:  { icon: 'utensils',       label: 'svc_restaurante' },
    churrascaria: { icon: 'beef',           label: 'svc_churrascaria' },
    lancheria:    { icon: 'sandwich',       label: 'svc_lancheria' },
    pizzaria:     { icon: 'pizza',          label: 'svc_pizzaria' },
    hamburgueria: { icon: 'sandwich',       label: 'svc_hamburgueria' },
    bar:          { icon: 'beer',           label: 'svc_bar' },
    cafe:         { icon: 'coffee',         label: 'svc_cafe' },
    sorveteria:   { icon: 'ice-cream-cone', label: 'svc_sorveteria' },
    esporte:      { icon: 'medal',          label: 'svc_esporte' },
  };

  let DATA = null;

  function mapsUrl(p) {
    const addr = (p.endereco || '').replace(/·/g, ',');
    const q = [p.nome, addr, 'Santo Cristo - RS'].filter(Boolean).join(', ');
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  }

  function svcCard(p) {
    const meta = KINDS[p.tipo] || { icon: 'map-pin', label: null };
    const card = document.createElement('article');
    card.className = 'svc reveal';

    const kind = document.createElement('span');
    kind.className = 'svc-kind';
    kind.innerHTML = '<i data-lucide="' + meta.icon + '"></i>';
    kind.appendChild(document.createTextNode(meta.label ? window.t(meta.label, p.tipo) : p.tipo));
    card.appendChild(kind);

    const h = document.createElement('h3');
    h.textContent = p.nome;
    card.appendChild(h);

    if (p.endereco) {
      const m = document.createElement('div');
      m.className = 'svc-meta';
      m.innerHTML = '<i data-lucide="map-pin"></i>';
      m.appendChild(document.createTextNode(p.endereco));
      card.appendChild(m);
    }

    const actions = document.createElement('div');
    actions.className = 'svc-actions';
    if (p.fone) {
      const tel = document.createElement('a');
      tel.href = 'tel:+55' + p.fone.replace(/\D/g, '').replace(/^55/, '');
      tel.innerHTML = '<i data-lucide="phone"></i>';
      tel.appendChild(document.createTextNode(p.fone));
      actions.appendChild(tel);
    }
    const maps = document.createElement('a');
    maps.className = 'svc-maps';
    maps.href = mapsUrl(p);
    maps.target = '_blank';
    maps.rel = 'noopener';
    maps.innerHTML = '<i data-lucide="map-pinned"></i>';
    maps.appendChild(document.createTextNode(window.t('atr_maps_btn', 'Ver no mapa')));
    actions.appendChild(maps);
    card.appendChild(actions);

    return card;
  }

  function fill(id, list) {
    const grid = document.getElementById(id);
    if (!grid) return;
    grid.innerHTML = '';
    (list || []).forEach((p) => grid.appendChild(svcCard(p)));
    if (window.__reobserveReveal) window.__reobserveReveal(grid);
  }

  function render() {
    if (!DATA) return;
    fill('hospedagem-grid', DATA.hospedagem);
    fill('gastronomia-grid', DATA.gastronomia);
    if (window.lucide) lucide.createIcons();
  }

  async function boot() {
    if (!document.getElementById('hospedagem-grid')) return;
    try {
      DATA = await (await fetch('data/servicos.json')).json();
    } catch (e) { console.error('Falha ao carregar serviços', e); return; }
    render();
  }

  document.addEventListener('core-ready', boot);
  document.addEventListener('langchange', () => { if (DATA) render(); });
})();
