# Portal Santo Cristo-RS — Design

**Data:** 2026-06-17
**Objetivo:** Site institucional/turístico estático para `santocristo.github.io`, inspirado na arquitetura de alegrete.org, destacando turismo e a capacidade produtiva (leite e suínos) do município.

## Arquitetura

- **Site estático** para GitHub Pages — HTML + CSS + JS vanilla, sem build.
- **Partials injetados** (`components/header.html`, `components/footer.html`) via `fetch()` em `js/app.js`.
- **Conteúdo data-driven**: atrativos em `data/atrativos.json`, renderizados como cards + marcadores Leaflet por `js/content.js`. Adicionar um ponto = editar JSON.
- **i18n** PT/ES/EN via `i18n/ui.{pt,es,en}.json` e atributos `data-i18n` / `data-i18n-html` / `data-i18n-attr`.
- **Ícones** Lucide (CDN), **mapas** Leaflet (CDN), **animações** reveal-on-scroll (IntersectionObserver).
- Namespace global: `window.SANTOCRISTO`. Chave de idioma em localStorage: `santocristo-lang`.

## Identidade visual

Paleta própria (colonização alemã + agro + rios): verde-campo, azul-rio (Lago Azul / Rio Uruguai), dourado-trigo/leite, off-white. Tipografia Fraunces (serif display) + Archivo (sans). Hero com o pórtico germânico.

## Páginas

1. **index.html** — Hero (pórtico) · boas-vindas + estatísticas (pop. ~15,7 mil; 367 km²; emancipação 1955; hexacampeã leite/suínos) · destaques de atrativos · teaser economia · localização/portos · CTAs.
2. **atrativos.html** — Cards + mapa Leaflet de todos os atrativos (Lago Azul, 3 Cascatas, Igreja Matriz, Santuário de Fátima, Grutinha, Museu, Parque de Eventos Enxaimel, balneários, Cervejaria Kerberhaus, Sítio Belinha, laticínios, etc.). Filtro por categoria.
3. **economia.html** — Hexacampeã (2024): leite 75,198 mi L/ano (~206 mil L/dia), suínos 138.222 cabeças; ranking estadual; soja/milho/trigo; agroindústrias; "Rotas da Produção"; "Fortalece Santo Cristo".
4. **historia.html** — Colonização alemã, emancipação 28/01/1955, distritos (Sírio, Vila Laranjeira, Vila Bom Princípio de Baixo), cultura (Blumengarten, FIC, Santa Cecília).
5. **como-chegar.html** — Distâncias (Porto Alegre 516 km, Santa Rosa ~20 km) e portos do Rio Uruguai (Porto Xavier, Porto Vera Cruz, Porto Mauá → travessias para a Argentina); mapa.
6. **contato.html** — Dados da Prefeitura (Esplanada Pref. Canísio Ost, 133; 55 3541-2000), formulário mailto, redes.

## Dados (fontes)

- IBGE Cidades; Wikipédia; Prefeitura de Santo Cristo (informações turísticas); Turismo RS; Jornal Noroeste (produção 2024); sites/Instagram do Lago Azul Acqua Park e Hotel Fazenda 3 Cascatas.

## Imagens

Placeholders SVG no tema + links externos oficiais nos cards. Usuário substitui pelas fotos reais depois.

## Fora de escopo (YAGNI)

Backend, formulário com servidor, CMS, build/bundler, páginas de saúde/moradia/esportes (foco em turismo + economia).
