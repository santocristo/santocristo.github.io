# Destaques do Noroeste Gaúcho — Design

**Data:** 2026-06-17
**Status:** Aprovado (design) — aguardando revisão da spec

## Problema

O portal de Santo Cristo-RS tem duas lacunas apontadas pelo usuário:

1. **Faltam imagens/fotos.** Todo o site usa placeholders intencionais (`.ph` com
   `data-ph="...substitua por foto real"`). Nenhum atrativo tem foto real.
2. **Falta uma página de atrativos/destaques da região.** A `atrativos.html` existe
   (grid + mapa, restrita a Santo Cristo), mas não há uma vitrine curada das grandes
   atrações do **Noroeste Gaúcho** nem das experiências-assinatura locais (ex.: colhe e
   pague da família Zamboni).

## Objetivo

Criar uma página curada **"Destaques do Noroeste Gaúcho"** que:
- Apresente os grandes ícones turísticos da região com **fotos reais**.
- Destaque experiências de sabores/agroturismo de Santo Cristo com **embeds** dos
  posts oficiais de Instagram/Facebook.
- Reaproveite o design system e a arquitetura data-driven já existentes.

Em paralelo, melhorar a página **"Como chegar"** com uma seção dedicada aos
**aeroportos mais próximos** (Santo Ângelo, Santa Rosa, Porto Alegre).

## Regra de estilo (obrigatória)

**Não usar travessão ("—") em nenhum texto do site** (HTML, JSON de conteúdo, i18n).
Reescrever com vírgula, parênteses, dois-pontos, ponto, ou "e"/"que". Vale para todo
conteúdo novo criado por esta spec.

Decisão confirmada: **fazer uma varredura global** e remover os travessões de TODOS os
arquivos de conteúdo já existentes (todos os `.html` de página, `components/*.html`,
`data/*.json`, `i18n/*.json`). Revisar cada substituição para manter a leitura natural,
sem trocar mecanicamente por outro caractere.

## Decisões tomadas (brainstorming)

- **Estratégia de imagem: híbrida e legal.**
  - Marcos públicos famosos → fotos do **Wikimedia Commons** (licença CC), baixadas
    para `assets/fotos/`, com crédito/atribuição num rodapé "Créditos das imagens".
  - Negócios privados locais → **embeds** dos posts oficiais (IG/FB). Sem baixar
    imagens de redes sociais.
- **Estrutura:** nova página `destaques.html` (novo item de menu), mantendo
  `atrativos.html` (grid + mapa) como está.
- **Embeds:** carregados sob demanda (lazy) via `IntersectionObserver`; o Instagram só
  incorpora **posts específicos** (permalink), então embeds são dado opcional por
  destaque — onde não há permalink, renderiza um "cartão social" com botões.

## Escopo de conteúdo

### Bloco 1 — Ícones do Noroeste Gaúcho (fotos CC)

| Atrativo | Cidade | Descrição | Categoria |
|---|---|---|---|
| Salto do Yucumã / Parque Estadual do Turvo | Derrubadas | Maior queda longitudinal do mundo (~1,8 km, até 20 m); maior parque estadual do RS (17.491 ha), último refúgio da onça-pintada no estado | `regiao` |
| Ruínas de São Miguel Arcanjo | São Miguel das Missões | Sítio jesuítico-guarani, Patrimônio Mundial da UNESCO; Museu das Missões; espetáculo Som e Luz | `regiao` |
| MEA – Memorial da Evolução Agrícola | Horizontina | Complexo cultural imersivo de ~64 mil m² sobre a história da agricultura no Brasil (aberto em 15/12/2023) | `regiao` |
| Salto do Roncador | Porto Vera Cruz | Queda d'água que se estende do lado brasileiro até o território argentino | `regiao` |
| Rio Uruguai · portos de fronteira | Porto Xavier / Porto Mauá / Porto Vera Cruz | Travessias de balsa para a Argentina; pesca e cultura ribeirinha | `regiao` |

### Bloco 2 — Sabores & Agroturismo de Santo Cristo (embeds)

| Experiência | Local | Fonte de mídia |
|---|---|---|
| Colhe e Pague Zamboni | Linha Bom Princípio (zona rural) | Embed IG `https://www.instagram.com/p/DSsz57WFeyB/` + vídeo FB `https://www.facebook.com/jacnewsoficial/videos/912501028010830/` |
| Doceoli Alimentos | Santo Cristo (desde 1998: biscoitos, lácteos, lasanhas, pizzas, salgados) | Site `https://doceoli.com.br` + IG `https://www.instagram.com/doceolialimentos/` (cartão social; embed quando houver permalink) |
| Tché Milk | RST 472, Km 01 | Cartão social / link |
| Cervejaria Kerberhaus | RST 472, Km 01 | Cartão social / link |
| Vinho colonial (Sítio Belinha) | Linha Dona Belinha | Cartão social / link |

### Bloco 3 — Aeroportos mais próximos (em `como-chegar.html`)

Nova seção na página "Como chegar", em cards, destacando os aeroportos mais próximos:

| Aeroporto | Cidade | IATA | Distância (aprox.) | Observação |
|---|---|---|---|---|
| Aeroporto Regional Sepé Tiaraju | Santo Ângelo | GEL | ~90 km | Aeroporto comercial mais próximo. Voos da Azul e Gol para Porto Alegre e São Paulo (Florianópolis em alta temporada) |
| Aeroporto Luís Alberto Lehr | Santa Rosa | SRA | ~20 km | Aeroporto regional, na cidade-polo vizinha |
| Aeroporto Internacional Salgado Filho | Porto Alegre | POA | ~516 km | Principal porta de entrada internacional do estado |

Dados sujeitos a confirmação de oferta de voos na implementação (malha aérea muda).

## Arquitetura

Segue o padrão data-driven existente (ver `js/content.js` + `data/atrativos.json`).

### Novos arquivos
- `destaques.html` — página com hero, bloco "Ícones do Noroeste Gaúcho", bloco
  "Sabores & Agroturismo" e rodapé de créditos de imagem.
- `js/destaques.js` — lê `data/destaques.json`, renderiza os blocos editoriais e
  gerencia o lazy-load dos scripts de embed (IG `embed.js`, FB SDK).
- `data/destaques.json` — conteúdo curado (ver modelo abaixo).
- `assets/fotos/` — fotos CC baixadas (ex.: `yucuma.jpg`, `sao-miguel.jpg`,
  `mea.jpg`, `roncador.jpg`, `rio-uruguai.jpg`), em formato `.jpg`/`.webp`.

### Arquivos modificados
- `components/header.html` — novo link "Destaques" entre *Atrativos* e *Economia*
  (nav desktop + nav mobile).
- `como-chegar.html` — nova seção "Aeroportos mais próximos" (cards) lendo
  `data/aeroportos.json`; ajustar a `obs` da tabela de distâncias sem travessão.
- `data/aeroportos.json` — novo arquivo com os aeroportos (nome, cidade, iata, km, obs).
- `i18n/ui.pt.json`, `ui.es.json`, `ui.en.json` — chave `nav_destaques`, textos da
  página de destaques (hero, títulos dos blocos, rótulo de créditos) e título da seção
  de aeroportos (`come_air_h`).
- `data/atrativos.json` — adicionar Salto do Yucumã, Ruínas de São Miguel, MEA, Salto
  do Roncador e Colhe e Pague Zamboni (categoria nova `regiao`/`agroturismo`); enriquecer
  Doceoli com links de site + Instagram.
- `js/content.js` — registrar as categorias novas (`regiao`, `agroturismo`) em `CATS`
  (ícone + cor + chave i18n).
- `css/styles.css` — estilos do bloco editorial de destaque, do cartão social e do
  container de embed responsivo, se necessário.

## Modelo de dados — `data/destaques.json`

Array de objetos:

```json
{
  "nome": "Colhe e Pague Zamboni",
  "nome_es": "...", "nome_en": "...",
  "bloco": "sabores",                 // "icones" | "sabores"
  "tag": "agroturismo",               // chave de categoria (rótulo via i18n)
  "cidade": "Santo Cristo · Linha Bom Princípio",
  "desc": "...", "desc_es": "...", "desc_en": "...",
  "img": "assets/fotos/xxx.jpg",      // usado no bloco "icones"
  "credito": "Foto: Autor (CC BY-SA 4.0) · Wikimedia Commons",
  "links": [
    { "label": "Instagram", "url": "https://...", "icon": "instagram" },
    { "label": "Site", "url": "https://...", "icon": "globe" }
  ],
  "embeds": [
    { "type": "instagram", "url": "https://www.instagram.com/p/DSsz57WFeyB/" },
    { "type": "facebook",  "url": "https://www.facebook.com/.../videos/912501028010830/" }
  ]
}
```

Campos `img`/`credito` para o bloco de ícones (fotos CC); `embeds`/`links` para o
bloco de sabores. Todos os campos de mídia são **opcionais**: ausência de `embeds`
faz cair no cartão social; ausência de `img` faz cair no placeholder existente.

## Fluxo de renderização (`js/destaques.js`)

1. `fetch('data/destaques.json')` no evento `core-ready` (padrão de `content.js`).
2. Renderiza bloco "Ícones" (cards com `img` + crédito) e bloco "Sabores" (blocos
   editoriais alternados texto/mídia).
3. Para cada embed: insere o markup (`blockquote.instagram-media` / `.fb-video`) mas
   **não carrega o script** até a seção entrar no viewport (`IntersectionObserver`).
   Ao entrar, injeta o script uma vez e chama `instgrm.Embeds.process()` /
   `FB.XFBML.parse()`.
4. Reprocessa no evento `langchange` (re-renderiza textos e reprocessa embeds).

## Tratamento de erros

- Falha ao carregar `data/destaques.json` → log no console e blocos vazios (não quebra
  a página), igual ao `content.js`.
- Embed que não carrega (script bloqueado/sem rede) → o `blockquote` de fallback do
  próprio IG/FB já mostra um link clicável para o post; o cartão social com botões
  permanece como alternativa para destaques sem permalink.
- Imagem CC ausente/404 → cai no placeholder `.ph` existente.

## Acessibilidade e desempenho

- Imagens com `alt` descritivo e `loading="lazy"`.
- Scripts de embed só carregam sob demanda (não penalizam o carregamento inicial).
- Créditos de imagem visíveis (atribuição exigida pelas licenças CC-BY/CC-BY-SA).

## Verificação de licença (obrigatório na implementação)

Antes de baixar cada foto do Wikimedia Commons, conferir a **página de descrição do
arquivo** para confirmar a licença exata (CC0 / CC-BY / CC-BY-SA / domínio público) e o
autor, e registrar a atribuição correta em `credito`. Não usar arquivos sem licença
livre clara.

## Versionamento

Commits feitos **direto na `main`** (decisão do usuário), em passos lógicos: (1)
varredura de travessões, (2) dados + categorias, (3) página de destaques + JS, (4)
fotos CC + créditos, (5) aeroportos em "Como chegar", (6) nav + i18n.

## Fora de escopo (YAGNI)

- Baixar/hospedar fotos de empresas privadas (uso embeds).
- CMS, painel de administração, analytics por post.
- Refatoração de páginas não relacionadas.
- Cobrir todos os 21 municípios da Rota do Yucumã — apenas os ícones listados.

## Fontes da pesquisa

- Rota do Yucumã / turismo Noroeste Gaúcho (21 municípios, Rota dos Chalés 2025).
- Salto do Yucumã / Parque Estadual do Turvo — Wikipédia e guias de viagem.
- Ruínas de São Miguel das Missões — Wikimedia Commons (imagens CC).
- MEA – Memorial da Evolução Agrícola, Horizontina — mea.org.br, imprensa regional.
- Doceoli — doceoli.com.br.
