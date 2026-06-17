# Destaques do Noroeste Gaúcho — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a curated "Destaques do Noroeste Gaúcho" page (regional landmarks with real CC photos + local food/agritourism with social embeds), add a nearest-airports section to "Como chegar", and remove every em dash from the site copy.

**Architecture:** Static site, data-driven. New page `destaques.html` reads `data/destaques.json` and renders two blocks via `js/destaques.js`; social embeds (Instagram/Facebook) lazy-load on scroll. Landmark photos are CC-licensed files downloaded from Wikimedia Commons into `assets/fotos/` with on-page credits. Follows existing patterns in `js/content.js` and `js/app.js`.

**Tech Stack:** Vanilla HTML/CSS/JS, Leaflet (already used), Lucide icons (already used), Instagram `embed.js`, Facebook page/video SDK. No build step. Python's `http.server` for local verification.

## Global Constraints

- **No em dash ("—") in any site text** (`.html`, `data/*.json`, `i18n/*.json`, `components/*.html`). Rewrite with comma, parentheses, colon, period, or "e"/"que". (The `docs/` spec/plan files are exempt.)
- All site copy exists in three languages: `pt`, `es`, `en` (i18n keys in `i18n/ui.<lang>.json`; JSON content uses `_es`/`_en` suffixed fields).
- Commits go **directly to `main`** in the logical steps below.
- Every commit message ends with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- Follow existing CSS class system; do not introduce a framework. Lucide icons via `lucide.createIcons()`; Leaflet already loaded where needed.
- Verification for this static site = (a) `python3 -m json.tool <file>` parses JSON, (b) page loads under `python3 -m http.server` with **no console errors**, (c) `grep -RnP "\x{2014}"` finds no em dash in site files.

---

## File Structure

- Create: `destaques.html` — curated highlights page (hero, icons block, flavors block, credits).
- Create: `js/destaques.js` — renders `data/destaques.json`, manages lazy social embeds.
- Create: `data/destaques.json` — curated content (icons + flavors).
- Create: `data/aeroportos.json` — nearest airports.
- Create: `assets/fotos/` — downloaded CC landmark photos.
- Modify: `js/content.js` — register `regiao` and `agroturismo` categories.
- Modify: `data/atrativos.json` — add regional landmarks + Zamboni; enrich Doceoli links.
- Modify: `components/header.html` — add "Destaques" nav link (desktop + mobile).
- Modify: `como-chegar.html` — add "Aeroportos mais próximos" section + render logic.
- Modify: `i18n/ui.pt.json`, `i18n/ui.es.json`, `i18n/ui.en.json` — new keys.
- Modify: `css/styles.css` — destaque block, social card, embed container styles.
- Sweep: all site `.html` / `data/*.json` / `i18n/*.json` / `components/*.html` for em dashes.

---

## Task 1: Remove every em dash from existing site copy

**Files:**
- Modify: all tracked `*.html` at repo root, `components/*.html`, `data/*.json`, `i18n/*.json`

**Interfaces:**
- Consumes: nothing.
- Produces: a site with zero em dashes; later tasks must keep it that way.

- [ ] **Step 1: List every occurrence**

Run:
```bash
grep -RnP "\x{2014}" --include="*.html" --include="*.json" . | grep -v "^./docs/"
```
Expected: a list of lines (in `index.html`, `atrativos.html`, `como-chegar.html`, `economia.html`, `historia.html`, `data/atrativos.json`, `i18n/ui.pt.json`, `i18n/ui.es.json`, `i18n/ui.en.json`, etc.).

- [ ] **Step 2: Rewrite each occurrence by hand**

For each line, edit the text so it reads naturally without "—". Apply these rewrite patterns (keep all three languages in sync when the same sentence exists in `ui.pt/es/en.json`):
- Parenthetical aside `A — B — C` → `A, B, C` or `A (B) C`.
- Appositive `X — Y` → `X: Y` or `X, Y`.
- Range/connector `leite e suínos — superando…` → `leite e suínos, superando…`.

Concrete examples (apply the same idea everywhere):
- `i18n/ui.pt.json` `home_about_p1`: `…dos antepassados — e transforma trabalho em prosperidade.` → `…dos antepassados, e transforma trabalho em prosperidade.`
- `i18n/ui.pt.json` `home_loc_p`: `…do Rio Uruguai — Porto Mauá, Porto Vera Cruz e Porto Xavier — com travessias…` → `…do Rio Uruguai (Porto Mauá, Porto Vera Cruz e Porto Xavier), com travessias…`
- `i18n/ui.pt.json` `come_lead`: `…516 km de Porto Alegre — e a poucos quilômetros…` → `…516 km de Porto Alegre, e a poucos quilômetros…`
- `i18n/ui.pt.json` `eco_champ_p`: `…do Rio Grande do Sul — superando municípios…` → `…do Rio Grande do Sul, superando municípios…`
- `data/atrativos.json` Lago Azul `desc`: `…à beira do rio. No local fica o Marco Zero…` already fine; fix `…do noroeste do RS. Piscinas…` only if it contains "—" (it does not). Fix any `desc`/`desc_es`/`desc_en` that contains "—" (e.g. Igreja Matriz `desc_en` "two 73-metre towers — the tallest…" → "two 73-metre towers, the tallest…").

Apply equivalent edits in `ui.es.json` and `ui.en.json` for the same keys.

- [ ] **Step 3: Verify none remain**

Run:
```bash
grep -RnP "\x{2014}" --include="*.html" --include="*.json" . | grep -v "^./docs/"
```
Expected: **no output**.

- [ ] **Step 4: Verify JSON still valid**

Run:
```bash
for f in data/*.json i18n/*.json; do python3 -m json.tool "$f" >/dev/null && echo "OK $f"; done
```
Expected: `OK` for every file.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "style: remove em dashes from site copy

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Register new categories and extend attractions data

**Files:**
- Modify: `js/content.js:10-24` (the `CATS` object)
- Modify: `data/atrativos.json`
- Modify: `i18n/ui.pt.json`, `i18n/ui.es.json`, `i18n/ui.en.json` (add `cat_regiao`, `cat_agroturismo`)

**Interfaces:**
- Consumes: existing `CATS` map and `makeCard`/`drawMarkers` in `js/content.js`.
- Produces: categories `regiao` (icon `mountain-snow`, color `#2f6f5a`) and `agroturismo` (icon `grape`, color `#7a2e4a`) usable by both `atrativos.html` and the new destaques page; new attractions visible in grid + map.

- [ ] **Step 1: Add the two categories to `CATS`**

In `js/content.js`, inside the `CATS` object (after the `esporte:` line), add:
```js
    regiao:      { icon: 'mountain-snow', color: '#2f6f5a', label: 'cat_regiao' },
    agroturismo: { icon: 'grape',         color: '#7a2e4a', label: 'cat_agroturismo' },
```

- [ ] **Step 2: Add the i18n labels (all three languages)**

In `i18n/ui.pt.json`, after `"cat_esporte": ...`, add:
```json
  "cat_regiao": "Noroeste Gaúcho",
  "cat_agroturismo": "Agroturismo",
```
In `i18n/ui.es.json` (same position): `"cat_regiao": "Noroeste Gaúcho", "cat_agroturismo": "Agroturismo",`
In `i18n/ui.en.json` (same position): `"cat_regiao": "Northwest RS", "cat_agroturismo": "Agritourism",`

- [ ] **Step 3: Add regional landmarks + Zamboni to `data/atrativos.json`**

Append these objects to the array in `data/atrativos.json` (before the closing `]`; add a comma after the current last object). Coordinates are approximate, for map orientation.
```json
  {
    "nome": "Salto do Yucumã",
    "categoria": "regiao",
    "destaque": true,
    "local": "Parque Estadual do Turvo, Derrubadas",
    "coords": [-27.1469, -53.8956],
    "desc": "A maior queda d'água longitudinal do mundo, com cerca de 1,8 km ao longo do Rio Uruguai, dentro do maior parque estadual do RS e último refúgio da onça-pintada no estado.",
    "desc_es": "La mayor cascada longitudinal del mundo, con cerca de 1,8 km a lo largo del Río Uruguay, dentro del mayor parque estatal de RS y último refugio del yaguareté en el estado.",
    "desc_en": "The world's largest longitudinal waterfall, about 1.8 km along the Uruguay River, inside the largest state park in RS and the last refuge of the jaguar in the state.",
    "links": []
  },
  {
    "nome": "Ruínas de São Miguel Arcanjo",
    "categoria": "regiao",
    "destaque": true,
    "local": "São Miguel das Missões",
    "coords": [-28.5547, -54.5561],
    "desc": "Sítio histórico jesuítico-guarani, Patrimônio Mundial da UNESCO. As ruínas da igreja de 1735 e o Museu das Missões guardam a memória dos Sete Povos, com espetáculo de som e luz à noite.",
    "desc_es": "Sitio histórico jesuítico-guaraní, Patrimonio Mundial de la UNESCO. Las ruinas de la iglesia de 1735 y el Museo de las Misiones guardan la memoria de los Siete Pueblos, con espectáculo de luz y sonido por la noche.",
    "desc_en": "A Jesuit-Guarani historic site and UNESCO World Heritage Site. The 1735 church ruins and the Missions Museum preserve the memory of the Seven Peoples, with a nighttime sound-and-light show.",
    "links": []
  },
  {
    "nome": "MEA Memorial da Evolução Agrícola",
    "categoria": "regiao",
    "destaque": true,
    "local": "Horizontina",
    "coords": [-27.6266, -54.3080],
    "desc": "Complexo cultural imersivo de cerca de 64 mil m² que conta a história da evolução da agricultura no Brasil com tecnologia e experiências sensoriais. Aberto ao público em dezembro de 2023.",
    "desc_es": "Complejo cultural inmersivo de cerca de 64 mil m² que cuenta la historia de la evolución de la agricultura en Brasil con tecnología y experiencias sensoriales. Abierto al público en diciembre de 2023.",
    "desc_en": "An immersive cultural complex of about 64,000 m² telling the story of agriculture in Brazil through technology and sensory experiences. Opened to the public in December 2023.",
    "links": []
  },
  {
    "nome": "Salto do Roncador",
    "categoria": "regiao",
    "local": "Porto Vera Cruz",
    "coords": [-27.7150, -54.8300],
    "desc": "Queda d'água que nasce no lado brasileiro e se estende por quase dois quilômetros até o território argentino. O som forte das águas explica o nome.",
    "desc_es": "Cascada que nace del lado brasileño y se extiende casi dos kilómetros hasta el territorio argentino. El fuerte sonido del agua explica su nombre.",
    "desc_en": "A waterfall that begins on the Brazilian side and stretches nearly two kilometers into Argentine territory. The loud roar of the water gives it its name.",
    "links": []
  },
  {
    "nome": "Colhe e Pague Zamboni",
    "categoria": "agroturismo",
    "destaque": true,
    "local": "Linha Bom Princípio, zona rural",
    "coords": [-27.7700, -54.7100],
    "desc": "Tradição de colher a própria uva direto das parreiras da família Zamboni. Um passeio de agroturismo que une o sabor da safra, a vida no interior e a hospitalidade colonial.",
    "desc_es": "Tradición de cosechar la propia uva directo de las parras de la familia Zamboni. Un paseo de agroturismo que une el sabor de la cosecha, la vida rural y la hospitalidad colonial.",
    "desc_en": "The tradition of picking your own grapes straight from the Zamboni family's vines. An agritourism outing blending the taste of the harvest, country life and colonial hospitality.",
    "links": [
      { "label": "Instagram", "url": "https://www.instagram.com/p/DSsz57WFeyB/", "icon": "instagram" }
    ]
  }
```

- [ ] **Step 4: Enrich Doceoli links in `data/atrativos.json`**

Find the Doceoli object (`"nome": "Doceoli Alimentos"`) and replace its `"links": []` with:
```json
    "links": [
      { "label": "Site", "url": "https://doceoli.com.br", "icon": "globe" },
      { "label": "Instagram", "url": "https://www.instagram.com/doceolialimentos/", "icon": "instagram" }
    ]
```

- [ ] **Step 5: Validate JSON**

Run:
```bash
python3 -m json.tool data/atrativos.json >/dev/null && echo OK
for f in i18n/ui.pt.json i18n/ui.es.json i18n/ui.en.json; do python3 -m json.tool "$f" >/dev/null && echo "OK $f"; done
```
Expected: `OK` for each.

- [ ] **Step 6: Visual check**

Run `python3 -m http.server 8000`, open `http://localhost:8000/atrativos.html`. Confirm: new "Noroeste Gaúcho" and "Agroturismo" filter buttons appear; the 5 new cards render; map shows new pins; **no console errors**. Confirm no em dash via `grep -RnP "\x{2014}" data/atrativos.json` → no output.

- [ ] **Step 7: Commit**

```bash
git add js/content.js data/atrativos.json i18n/ui.pt.json i18n/ui.es.json i18n/ui.en.json
git commit -m "feat: add regional landmarks, Zamboni and Doceoli links to attractions

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Create the destaques content data

**Files:**
- Create: `data/destaques.json`

**Interfaces:**
- Consumes: nothing.
- Produces: array of destaque objects with fields `nome`, `nome_es?`, `nome_en?`, `bloco` (`"icones"|"sabores"`), `tag`, `cidade`, `desc`/`desc_es`/`desc_en`, `img?`, `credito?`, `links?` (array of `{label,url,icon}`), `embeds?` (array of `{type:"instagram"|"facebook", url}`). Consumed by `js/destaques.js` (Task 4).

- [ ] **Step 1: Write `data/destaques.json`**

```json
[
  {
    "nome": "Salto do Yucumã",
    "bloco": "icones",
    "tag": "regiao",
    "cidade": "Derrubadas, RS",
    "desc": "A maior queda d'água longitudinal do mundo, com cerca de 1,8 km ao longo do Rio Uruguai, dentro do Parque Estadual do Turvo, o maior parque estadual do RS e último refúgio da onça-pintada no estado.",
    "desc_es": "La mayor cascada longitudinal del mundo, con cerca de 1,8 km a lo largo del Río Uruguay, dentro del Parque Estadual do Turvo, el mayor parque estatal de RS y último refugio del yaguareté.",
    "desc_en": "The world's largest longitudinal waterfall, about 1.8 km along the Uruguay River inside Parque Estadual do Turvo, the largest state park in RS and the last refuge of the jaguar.",
    "img": "assets/fotos/salto-yucuma.jpg",
    "credito": "PREENCHER NA TASK 6",
    "links": []
  },
  {
    "nome": "Ruínas de São Miguel Arcanjo",
    "bloco": "icones",
    "tag": "regiao",
    "cidade": "São Miguel das Missões, RS",
    "desc": "Sítio histórico jesuítico-guarani tombado como Patrimônio Mundial pela UNESCO. As ruínas da igreja de 1735 e o Museu das Missões guardam a memória dos Sete Povos das Missões, com espetáculo de som e luz à noite.",
    "desc_es": "Sitio histórico jesuítico-guaraní declarado Patrimonio Mundial por la UNESCO. Las ruinas de la iglesia de 1735 y el Museo de las Misiones guardan la memoria de los Siete Pueblos, con espectáculo de luz y sonido por la noche.",
    "desc_en": "A Jesuit-Guarani historic site listed as a UNESCO World Heritage Site. The 1735 church ruins and the Missions Museum preserve the memory of the Seven Peoples, with a nighttime sound-and-light show.",
    "img": "assets/fotos/sao-miguel.jpg",
    "credito": "PREENCHER NA TASK 6",
    "links": []
  },
  {
    "nome": "MEA Memorial da Evolução Agrícola",
    "bloco": "icones",
    "tag": "regiao",
    "cidade": "Horizontina, RS",
    "desc": "Complexo cultural imersivo de cerca de 64 mil m² que conta a história da evolução da agricultura no Brasil com tecnologia e experiências sensoriais. Aberto ao público em dezembro de 2023.",
    "desc_es": "Complejo cultural inmersivo de cerca de 64 mil m² que cuenta la historia de la evolución de la agricultura en Brasil con tecnología y experiencias sensoriales. Abierto al público en diciembre de 2023.",
    "desc_en": "An immersive cultural complex of about 64,000 m² telling the story of agriculture in Brazil through technology and sensory experiences. Opened to the public in December 2023.",
    "img": "assets/fotos/mea.jpg",
    "credito": "PREENCHER NA TASK 6",
    "links": [
      { "label": "Site", "url": "https://www.mea.org.br", "icon": "globe" }
    ]
  },
  {
    "nome": "Salto do Roncador",
    "bloco": "icones",
    "tag": "regiao",
    "cidade": "Porto Vera Cruz, RS",
    "desc": "Queda d'água que nasce no lado brasileiro e se estende por quase dois quilômetros até o território argentino. O som forte das águas explica o nome.",
    "desc_es": "Cascada que nace del lado brasileño y se extiende casi dos kilómetros hasta el territorio argentino. El fuerte sonido del agua explica su nombre.",
    "desc_en": "A waterfall that begins on the Brazilian side and stretches nearly two kilometers into Argentine territory. The loud roar of the water gives it its name.",
    "img": "assets/fotos/roncador.jpg",
    "credito": "PREENCHER NA TASK 6",
    "links": []
  },
  {
    "nome": "Rio Uruguai e portos de fronteira",
    "bloco": "icones",
    "tag": "regiao",
    "cidade": "Porto Xavier, Porto Mauá e Porto Vera Cruz",
    "desc": "Os portos do Rio Uruguai conectam o Noroeste Gaúcho à Argentina por travessias de balsa, num cenário de pesca, gastronomia ribeirinha e integração cultural.",
    "desc_es": "Los puertos del Río Uruguay conectan el Noroeste Gaúcho con Argentina mediante travesías en balsa, en un escenario de pesca, gastronomía ribereña e integración cultural.",
    "desc_en": "The Uruguay River ports connect Northwest RS to Argentina by ferry crossings, amid fishing, riverside cuisine and cultural exchange.",
    "img": "assets/fotos/rio-uruguai.jpg",
    "credito": "PREENCHER NA TASK 6",
    "links": []
  },

  {
    "nome": "Colhe e Pague Zamboni",
    "bloco": "sabores",
    "tag": "agroturismo",
    "cidade": "Santo Cristo, Linha Bom Princípio",
    "desc": "Tradição de colher a própria uva direto das parreiras da família Zamboni. Um passeio de agroturismo que une o sabor da safra, a vida no interior e a hospitalidade colonial.",
    "desc_es": "Tradición de cosechar la propia uva directo de las parras de la familia Zamboni. Un paseo de agroturismo que une el sabor de la cosecha, la vida rural y la hospitalidad colonial.",
    "desc_en": "The tradition of picking your own grapes straight from the Zamboni family's vines. An agritourism outing blending the taste of the harvest, country life and colonial hospitality.",
    "links": [
      { "label": "Instagram", "url": "https://www.instagram.com/p/DSsz57WFeyB/", "icon": "instagram" },
      { "label": "Facebook", "url": "https://www.facebook.com/jacnewsoficial/videos/912501028010830/", "icon": "facebook" }
    ],
    "embeds": [
      { "type": "instagram", "url": "https://www.instagram.com/p/DSsz57WFeyB/" }
    ]
  },
  {
    "nome": "Doceoli Alimentos",
    "bloco": "sabores",
    "tag": "agro",
    "cidade": "Santo Cristo, RS",
    "desc": "Indústria de alimentos nascida em 1998, hoje uma das grandes da região, com biscoitos, lácteos, lasanhas, pizzas e salgados que levam o nome de Santo Cristo para todo o Brasil.",
    "desc_es": "Industria de alimentos nacida en 1998, hoy una de las grandes de la región, con galletas, lácteos, lasañas, pizzas y salados que llevan el nombre de Santo Cristo por todo Brasil.",
    "desc_en": "A food company founded in 1998, now one of the region's largest, with cookies, dairy, lasagnas, pizzas and savory snacks that carry the Santo Cristo name across Brazil.",
    "links": [
      { "label": "Site", "url": "https://doceoli.com.br", "icon": "globe" },
      { "label": "Instagram", "url": "https://www.instagram.com/doceolialimentos/", "icon": "instagram" }
    ]
  },
  {
    "nome": "Tché Milk",
    "bloco": "sabores",
    "tag": "agro",
    "cidade": "Santo Cristo, RST 472, Km 01",
    "desc": "Laticínio premiado com medalha de ouro pela mussarela, com showroom aberto a visitantes, vitrine da força leiteira de Santo Cristo.",
    "desc_es": "Lácteo premiado con medalla de oro por la mozzarella, con showroom abierto a visitantes, vitrina de la fuerza lechera de Santo Cristo.",
    "desc_en": "An award-winning dairy (gold medal for its mozzarella) with a showroom open to visitors, a showcase of Santo Cristo's dairy strength.",
    "links": []
  },
  {
    "nome": "Cervejaria Kerberhaus",
    "bloco": "sabores",
    "tag": "bebidas",
    "cidade": "Santo Cristo, RST 472, Km 01",
    "desc": "Cervejaria artesanal que produz pilsen, premium e IPA. O pub serve hambúrgueres, pratos regionais e sobremesas, com música ao vivo aos sábados.",
    "desc_es": "Cervecería artesanal que produce pilsen, premium e IPA. El pub sirve hamburguesas, platos regionales y postres, con música en vivo los sábados.",
    "desc_en": "A craft brewery making pilsner, premium and IPA beers. The pub serves burgers, regional dishes and desserts, with live music on Saturdays.",
    "links": []
  },
  {
    "nome": "Vinho colonial do Sítio Belinha",
    "bloco": "sabores",
    "tag": "colonial",
    "cidade": "Santo Cristo, Linha Dona Belinha",
    "desc": "Refúgio rural conhecido pelo vinho artesanal e pelos produtos coloniais da casa, com chalé, piscina e quiosque com churrasqueira.",
    "desc_es": "Refugio rural conocido por el vino artesanal y los productos coloniales de la casa, con cabaña, piscina y quiosco con parrilla.",
    "desc_en": "A rural retreat known for its homemade wine and colonial products, with a chalet, pool and barbecue kiosk.",
    "links": []
  }
]
```
(The `credito` value `"PREENCHER NA TASK 6"` is a deliberate handoff to Task 6, which downloads the photo and writes the real attribution. It must not survive past Task 6.)

- [ ] **Step 2: Validate JSON**

Run: `python3 -m json.tool data/destaques.json >/dev/null && echo OK` → Expected: `OK`.
Run: `grep -nP "\x{2014}" data/destaques.json` → Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add data/destaques.json
git commit -m "feat: add destaques content data (icons + flavors)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Build the destaques page and renderer

**Files:**
- Create: `destaques.html`
- Create: `js/destaques.js`
- Modify: `i18n/ui.pt.json`, `ui.es.json`, `ui.en.json` (page strings)

**Interfaces:**
- Consumes: `data/destaques.json` (Task 3); `window.t`, `core-ready`/`langchange` events, `window.__reobserveReveal`, `CATS` label keys (via i18n) from `js/app.js`/`js/content.js`.
- Produces: a working page. The renderer reads each item's `bloco` to place it in `#destaques-icones` or `#destaques-sabores`.

- [ ] **Step 1: Add page i18n strings (all three languages)**

In `i18n/ui.pt.json`, after the `come_*` block, add:
```json
  "nav_destaques": "Destaques",
  "des_h": "Destaques do Noroeste Gaúcho",
  "des_lead": "Dos grandes ícones da região aos sabores e ao agroturismo de Santo Cristo. Conheça o que faz o Noroeste Gaúcho um destino único.",
  "des_icons_h": "Ícones do Noroeste Gaúcho",
  "des_icons_p": "Marcos naturais e históricos que projetam a região no mapa do turismo gaúcho.",
  "des_flavors_h": "Sabores e agroturismo",
  "des_flavors_p": "Experiências de Santo Cristo que unem trabalho, tradição e sabor colonial.",
  "des_credits_h": "Créditos das imagens",
  "des_follow": "Ver no Instagram",
```
In `i18n/ui.es.json` (same position):
```json
  "nav_destaques": "Destacados",
  "des_h": "Destacados del Noroeste Gaúcho",
  "des_lead": "De los grandes íconos de la región a los sabores y el agroturismo de Santo Cristo. Conozca lo que hace del Noroeste Gaúcho un destino único.",
  "des_icons_h": "Íconos del Noroeste Gaúcho",
  "des_icons_p": "Hitos naturales e históricos que proyectan la región en el mapa del turismo gaúcho.",
  "des_flavors_h": "Sabores y agroturismo",
  "des_flavors_p": "Experiencias de Santo Cristo que unen trabajo, tradición y sabor colonial.",
  "des_credits_h": "Créditos de las imágenes",
  "des_follow": "Ver en Instagram",
```
In `i18n/ui.en.json` (same position):
```json
  "nav_destaques": "Highlights",
  "des_h": "Highlights of Northwest RS",
  "des_lead": "From the region's great icons to the flavors and agritourism of Santo Cristo. Discover what makes Northwest RS a unique destination.",
  "des_icons_h": "Icons of Northwest RS",
  "des_icons_p": "Natural and historic landmarks that put the region on the tourism map.",
  "des_flavors_h": "Flavors and agritourism",
  "des_flavors_p": "Santo Cristo experiences blending work, tradition and colonial flavor.",
  "des_credits_h": "Image credits",
  "des_follow": "View on Instagram",
```

- [ ] **Step 2: Create `destaques.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Destaques do Noroeste Gaúcho · Santo Cristo-RS</title>
  <meta name="description" content="Destaques do Noroeste Gaúcho: Salto do Yucumã, Ruínas de São Miguel, MEA Horizontina, mais os sabores e o agroturismo de Santo Cristo (colhe e pague Zamboni, Doceoli, Tché Milk)." />
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=Archivo:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/styles.css" />
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="js/app.js" defer></script>
  <script src="js/destaques.js" defer></script>
</head>
<body>
  <div id="header-slot"></div>

  <section class="page-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="index.html" data-i18n="nav_home">Início</a> · <span data-i18n="nav_destaques">Destaques</span></div>
      <h1 data-i18n="des_h">Destaques do Noroeste Gaúcho</h1>
      <p class="lead" data-i18n="des_lead">Dos grandes ícones da região aos sabores e ao agroturismo de Santo Cristo.</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow" data-i18n="des_icons_h">Ícones do Noroeste Gaúcho</span>
        <h2 data-i18n="des_icons_h">Ícones do Noroeste Gaúcho</h2>
        <p data-i18n="des_icons_p">Marcos naturais e históricos que projetam a região no mapa do turismo gaúcho.</p>
      </div>
      <div class="grid grid-3" id="destaques-icones"></div>
    </div>
  </section>

  <section class="section section--cream">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow" data-i18n="des_flavors_h">Sabores e agroturismo</span>
        <h2 data-i18n="des_flavors_h">Sabores e agroturismo</h2>
        <p data-i18n="des_flavors_p">Experiências de Santo Cristo que unem trabalho, tradição e sabor colonial.</p>
      </div>
      <div id="destaques-sabores"></div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <h2 class="credits-h" data-i18n="des_credits_h">Créditos das imagens</h2>
      <ul class="credits-list" id="destaques-credits"></ul>
    </div>
  </section>

  <div id="footer-slot"></div>
</body>
</html>
```

- [ ] **Step 3: Create `js/destaques.js`**

```js
/* ============================================================
   Portal Santo Cristo — página de Destaques do Noroeste Gaúcho
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
      li.textContent = name(p) + ' — ' + p.credito; // see note below
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
```

NOTE on the credits separator: the Global Constraint forbids the em dash in **site copy**. The credits line joins a name and an attribution. Use a middot, not an em dash: change `li.textContent = name(p) + ' — ' + p.credito;` to:
```js
      li.textContent = name(p) + ' · ' + p.credito;
```
Use the middot version in the actual file.

- [ ] **Step 4: Validate and visually check**

Run: `python3 -m json.tool i18n/ui.pt.json >/dev/null && python3 -m json.tool i18n/ui.es.json >/dev/null && python3 -m json.tool i18n/ui.en.json >/dev/null && echo OK` → `OK`.
Run `python3 -m http.server 8000`; open `http://localhost:8000/destaques.html`. Confirm: hero renders; 5 icon cards (with placeholders until Task 6) in the icons grid; 5 flavor blocks alternating; the Zamboni block shows an Instagram embed after scrolling to it; switching language updates text; **no console errors** (third-party embed network warnings are acceptable, JS exceptions are not).
Run: `grep -nP "\x{2014}" destaques.html js/destaques.js` → no output.

- [ ] **Step 5: Commit**

```bash
git add destaques.html js/destaques.js i18n/ui.pt.json i18n/ui.es.json i18n/ui.en.json
git commit -m "feat: add Destaques do Noroeste Gaúcho page with lazy social embeds

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Style the destaque blocks, social card and embeds

**Files:**
- Modify: `css/styles.css` (append a new section at end of file)

**Interfaces:**
- Consumes: existing CSS variables (`--line`, `--radius`, `--green`, `--muted`, `--shadow-sm`, etc.) and classes (`.card`, `.card-media`, `.card-meta`, `.card-links`).
- Produces: `.destaque-row`, `.destaque-row--rev`, `.destaque-text`, `.destaque-media`, `.social-card`, `.credits-h`, `.credits-list` styles.

- [ ] **Step 1: Append styles to `css/styles.css`**

```css
/* ===== Página de Destaques ===== */
.destaque-row {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: clamp(24px, 4vw, 56px); align-items: center;
  padding: clamp(22px, 4vw, 40px) 0; border-bottom: 1px solid var(--line);
}
.destaque-row:last-child { border-bottom: 0; }
.destaque-row--rev .destaque-text { order: 2; }
.destaque-row--rev .destaque-media { order: 1; }
.destaque-text h3 { font-size: clamp(1.4rem, 2.6vw, 2rem); margin: 0 0 10px; }
.destaque-text p { color: var(--muted); margin: 10px 0 14px; }
.destaque-media { min-width: 0; }
.destaque-media .instagram-media { margin: 0 auto !important; }
.destaque-media .fb-video { display: flex; justify-content: center; }
.social-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; aspect-ratio: 4/3; border: 1px solid var(--line); border-radius: var(--radius);
  background: linear-gradient(160deg, var(--green) 0%, var(--teal) 60%, var(--river) 100%);
  color: #fff; text-align: center; padding: 24px; box-shadow: var(--shadow-sm);
}
.social-card i, .social-card svg { width: 40px; height: 40px; }
.social-card span { font-family: var(--serif); font-size: 1.2rem; font-weight: 600; }
.credits-h { font-size: 1.1rem; margin: 0 0 12px; }
.credits-list { list-style: none; padding: 0; margin: 0; color: var(--muted); font-size: 0.85rem; }
.credits-list li { padding: 4px 0; border-bottom: 1px dashed var(--line); }
@media (max-width: 760px) {
  .destaque-row { grid-template-columns: 1fr; }
  .destaque-row--rev .destaque-text { order: 1; }
  .destaque-row--rev .destaque-media { order: 2; }
}
```

- [ ] **Step 2: Visual check**

Reload `http://localhost:8000/destaques.html`. Confirm: flavor rows alternate left/right on desktop; stack cleanly on a narrow window (resize to <760px); social cards show a gradient with icon + name; Instagram embed is centered. **No console errors.**

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "style: add destaque rows, social card and embed layout

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Download CC landmark photos and write credits

**Files:**
- Create: `assets/fotos/*.jpg`
- Modify: `data/destaques.json` (replace each `"PREENCHER NA TASK 6"` credito; remove `img` if no free file exists)
- Modify: `data/atrativos.json` (optional: add matching `img` to the same landmarks)

**Interfaces:**
- Consumes: `data/destaques.json` icon entries from Task 3 (filenames `salto-yucuma.jpg`, `sao-miguel.jpg`, `mea.jpg`, `roncador.jpg`, `rio-uruguai.jpg`).
- Produces: real photos + accurate attribution strings.

- [ ] **Step 1: Create the folder**

Run: `mkdir -p assets/fotos`

- [ ] **Step 2: For São Miguel das Missões, verify license then download**

These candidate files were found on Wikimedia Commons:
- `https://upload.wikimedia.org/wikipedia/commons/4/40/Ru%C3%ADnas_de_S%C3%A3o_Miguel_das_Miss%C3%B5es._Vista_lateral.jpg`
- `https://upload.wikimedia.org/wikipedia/commons/3/38/Misi%C3%B3n_jesu%C3%ADtica_de_S%C3%A3o_Miguel_das_Miss%C3%B5es.jpg`

Open the matching Commons file description page (replace `upload.wikimedia.org/wikipedia/commons/X/YY/FILE` with `commons.wikimedia.org/wiki/File:FILE`) and confirm the license is CC0, CC-BY, CC-BY-SA, or Public Domain, and read the author. Then download:
```bash
curl -L -A "santocristo-site/1.0" -o assets/fotos/sao-miguel.jpg \
  "https://upload.wikimedia.org/wikipedia/commons/4/40/Ru%C3%ADnas_de_S%C3%A3o_Miguel_das_Miss%C3%B5es._Vista_lateral.jpg"
```
Verify it is a real image: `file assets/fotos/sao-miguel.jpg` → expect "JPEG image data". If not an image (HTML error), pick the other candidate.

- [ ] **Step 3: For Yucumã, MEA, Roncador, Rio Uruguai, find a free file**

For each, browse `https://commons.wikimedia.org/wiki/Category:<topic>` (e.g. `Salto_do_Yucum%C3%A3` / `Parque_Estadual_do_Turvo`, `Horizontina`, `Rio_Uruguai`). For each landmark:
- If a CC/PD file exists: confirm license + author on its file page, download via its `upload.wikimedia.org` URL to the target filename (`salto-yucuma.jpg`, `mea.jpg`, `roncador.jpg`, `rio-uruguai.jpg`), and `file <path>` to confirm it is a JPEG.
- If **no** free file exists (likely for MEA, a 2023 building, and possibly Roncador): in `data/destaques.json`, **remove the `img` and `credito` fields** from that entry so the renderer falls back to the styled placeholder. Do not invent a credit or use a non-free image.

- [ ] **Step 4: Write the real credits**

In `data/destaques.json`, for every entry that kept an `img`, replace `"PREENCHER NA TASK 6"` with the real attribution in the form required by the license, e.g.:
`"Foto: <Autor>, <Licença> (ex.: CC BY-SA 4.0), via Wikimedia Commons"`.
Confirm no `"PREENCHER NA TASK 6"` remains:
```bash
grep -n "PREENCHER" data/destaques.json
```
Expected: no output.

- [ ] **Step 5: Validate and visual check**

Run: `python3 -m json.tool data/destaques.json >/dev/null && echo OK` → `OK`.
Run: `grep -nP "\x{2014}" data/destaques.json` → no output.
Reload `destaques.html`: landmarks with a photo now show it; landmarks without show the placeholder; the "Créditos das imagens" list shows one line per photo. **No console errors.**

- [ ] **Step 6: Commit**

```bash
git add assets/fotos data/destaques.json data/atrativos.json
git commit -m "feat: add CC-licensed landmark photos with credits

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Add "Destaques" to the navigation

**Files:**
- Modify: `components/header.html` (desktop nav lines 7-14, mobile nav lines 29-36)

**Interfaces:**
- Consumes: `nav_destaques` i18n key (added in Task 4); active-nav logic in `js/app.js:99-103` (matches by `href` filename).
- Produces: nav link present on every page.

- [ ] **Step 1: Add the desktop nav link**

In `components/header.html`, in the `<nav class="nav">` block, add after the Atrativos line:
```html
      <a href="destaques.html"   data-i18n="nav_destaques">Destaques</a>
```

- [ ] **Step 2: Add the mobile nav link**

In the `<nav class="mobile-nav">` block, add after the Atrativos line:
```html
  <a href="destaques.html"   data-i18n="nav_destaques">Destaques</a>
```

- [ ] **Step 3: Visual check**

Reload any page (e.g. `index.html`). Confirm "Destaques" appears in the header between Atrativos and Economia, links to `destaques.html`, and is highlighted as active when on that page. Check the mobile menu (narrow window + burger). **No console errors.**

- [ ] **Step 4: Commit**

```bash
git add components/header.html
git commit -m "feat: add Destaques link to site navigation

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Add nearest-airports section to "Como chegar"

**Files:**
- Create: `data/aeroportos.json`
- Modify: `como-chegar.html` (add a section + render logic in the existing inline script)
- Modify: `i18n/ui.pt.json`, `ui.es.json`, `ui.en.json` (`come_air_h`, `come_air_p`)

**Interfaces:**
- Consumes: `core-ready` event and Lucide (already used by `como-chegar.html`).
- Produces: an airports section reading `data/aeroportos.json` (fields `nome`, `cidade`, `iata`, `km`, `obs`/`obs_es`/`obs_en`).

- [ ] **Step 1: Create `data/aeroportos.json`**

```json
[
  {
    "nome": "Aeroporto Regional Sepé Tiaraju",
    "cidade": "Santo Ângelo",
    "iata": "GEL",
    "km": 90,
    "obs": "Aeroporto comercial mais próximo, com voos da Azul e da Gol para Porto Alegre e São Paulo.",
    "obs_es": "Aeropuerto comercial más cercano, con vuelos de Azul y Gol a Porto Alegre y São Paulo.",
    "obs_en": "Nearest commercial airport, with Azul and Gol flights to Porto Alegre and São Paulo."
  },
  {
    "nome": "Aeroporto Luís Alberto Lehr",
    "cidade": "Santa Rosa",
    "iata": "SRA",
    "km": 20,
    "obs": "Aeroporto regional na cidade-polo vizinha.",
    "obs_es": "Aeropuerto regional en la ciudad vecina.",
    "obs_en": "Regional airport in the neighboring hub city."
  },
  {
    "nome": "Aeroporto Internacional Salgado Filho",
    "cidade": "Porto Alegre",
    "iata": "POA",
    "km": 516,
    "obs": "Principal porta de entrada internacional do Rio Grande do Sul.",
    "obs_es": "Principal puerta de entrada internacional de Rio Grande do Sul.",
    "obs_en": "Main international gateway of Rio Grande do Sul."
  }
]
```
Validate: `python3 -m json.tool data/aeroportos.json >/dev/null && echo OK` → `OK`.

- [ ] **Step 2: Add i18n strings (all three languages)**

`i18n/ui.pt.json` after `come_ports_p`:
```json
  "come_air_h": "Aeroportos mais próximos",
  "come_air_p": "O aeroporto comercial mais próximo é o de Santo Ângelo. Veja as opções para chegar de avião.",
```
`i18n/ui.es.json`:
```json
  "come_air_h": "Aeropuertos más cercanos",
  "come_air_p": "El aeropuerto comercial más cercano es el de Santo Ângelo. Vea las opciones para llegar en avión.",
```
`i18n/ui.en.json`:
```json
  "come_air_h": "Nearest airports",
  "come_air_p": "The nearest commercial airport is in Santo Ângelo. Here are the options for arriving by plane.",
```

- [ ] **Step 3: Add the airports section to `como-chegar.html`**

Insert this `<section>` between the distances section (ends line 47) and the ports section (`<section class="section section--cream">`):
```html
  <section class="section section--cream">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow"><i data-lucide="plane" style="width:16px;height:16px;vertical-align:-3px;"></i> <span data-i18n="come_air_h">Aeroportos mais próximos</span></span>
        <h2 data-i18n="come_air_h">Aeroportos mais próximos</h2>
        <p data-i18n="come_air_p">O aeroporto comercial mais próximo é o de Santo Ângelo.</p>
      </div>
      <div class="grid grid-3" id="air-grid"></div>
    </div>
  </section>
```
Change the following ports section's class from `section section--cream` to `section` so the cream/white stripes do not repeat:
```html
  <section class="section">
```

- [ ] **Step 4: Add render logic to the inline script**

In `como-chegar.html`, inside the `core-ready` handler, after the distances table loop (after `if (window.lucide) lucide.createIcons();` near line 82), add:
```js
      // Aeroportos
      let airports = [];
      try { airports = await (await fetch('data/aeroportos.json')).json(); }
      catch (e) { console.error(e); }
      const lang = window.SANTOCRISTO.lang;
      const airGrid = document.getElementById('air-grid');
      if (airGrid) {
        airports.forEach(function (a) {
          const obs = (lang !== 'pt' && a['obs_' + lang]) ? a['obs_' + lang] : a.obs;
          const card = document.createElement('article');
          card.className = 'card reveal';
          card.innerHTML =
            '<div class="card-body">' +
              '<h3>' + a.nome + ' <span class="iata">' + a.iata + '</span></h3>' +
              '<div class="card-meta"><i data-lucide="map-pin"></i>' + a.cidade + ' · ' + a.km + ' km</div>' +
              '<p></p>' +
            '</div>';
          card.querySelector('p').textContent = obs;
          airGrid.appendChild(card);
        });
        if (window.lucide) lucide.createIcons();
        if (window.__reobserveReveal) window.__reobserveReveal(airGrid);
      }
```

- [ ] **Step 5: Add a small style for the IATA badge**

Append to `css/styles.css`:
```css
.iata { display: inline-block; background: var(--green); color: #fff; font-family: var(--sans); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; padding: 2px 7px; border-radius: 6px; vertical-align: middle; }
```

- [ ] **Step 6: Validate and visual check**

Run: `for f in data/aeroportos.json i18n/ui.pt.json i18n/ui.es.json i18n/ui.en.json; do python3 -m json.tool "$f" >/dev/null && echo "OK $f"; done` → all `OK`.
Open `http://localhost:8000/como-chegar.html`. Confirm: a new "Aeroportos mais próximos" section shows 3 cards (Santo Ângelo/GEL, Santa Rosa/SRA, Porto Alegre/POA) with IATA badges; language switch updates the `obs`; section stripes alternate sensibly; **no console errors**.
Run: `grep -nP "\x{2014}" como-chegar.html data/aeroportos.json` → no output.

- [ ] **Step 7: Commit**

```bash
git add data/aeroportos.json como-chegar.html i18n/ui.pt.json i18n/ui.es.json i18n/ui.en.json css/styles.css
git commit -m "feat: add nearest-airports section to Como chegar

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final verification (after all tasks)

- [ ] No em dash anywhere in site files:
  `grep -RnP "\x{2014}" --include="*.html" --include="*.json" . | grep -v "^./docs/"` → no output.
- [ ] All JSON valid: `for f in data/*.json i18n/*.json; do python3 -m json.tool "$f" >/dev/null && echo "OK $f"; done`.
- [ ] Every page loads with no console errors: `index.html`, `atrativos.html`, `destaques.html`, `economia.html`, `historia.html`, `como-chegar.html`, `contato.html`.
- [ ] Language switch (PT/ES/EN) works on `destaques.html` and `como-chegar.html`.
- [ ] `git status` clean; `git log --oneline` shows the task commits on `main`.
```
