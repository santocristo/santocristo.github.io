# santocristo.github.io

Portal turístico e institucional de **Santo Cristo-RS** — terra do leite, dos suínos e da
hospitalidade alemã, na Fronteira Noroeste do Rio Grande do Sul.

Site estático (HTML + CSS + JS vanilla) para GitHub Pages, inspirado na arquitetura de
[alegrete.org](https://github.com/alegrete-rs/alegrete-rs.github.io).

## Estrutura

```
index.html              Home (hero, destaques, economia, localização)
atrativos.html          Cards + mapa Leaflet de todos os atrativos
economia.html           Hexacampeã em leite/suínos + ranking estadual 2024
historia.html           Colonização alemã, emancipação 1955, cultura
como-chegar.html        Distâncias e portos do Rio Uruguai + mapa
contato.html            Canal de sugestões via WhatsApp

components/             header.html e footer.html (injetados por fetch)
css/styles.css          Tema (verde-campo · azul-rio · dourado-trigo)
js/app.js               i18n, navegação, reveal, injeção de partials
js/content.js           Render data-driven de atrativos + mapa
data/                   atrativos.json · economia.json · distancias.json
i18n/                   ui.pt.json · ui.es.json · ui.en.json (PT/ES/EN)
assets/                 favicon e logos (SVG)
```

## Como editar o conteúdo

- **Adicionar um atrativo:** edite `data/atrativos.json` (categoria, descrição, coordenadas, links).
  Marque `"destaque": true` para aparecer na home.
- **Trocar imagens:** substitua os placeholders `.ph` por `<img>` reais (pórtico, Lago Azul, 3 Cascatas…).
- **Traduções:** os textos de interface ficam em `i18n/ui.{pt,es,en}.json`.

## Rodar localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

> Portal informativo. Dados de IBGE, Prefeitura de Santo Cristo, Turismo RS, Wikipédia e
> Jornal Noroeste (produção 2024). Imagens dos placeholders são ilustrativas.
