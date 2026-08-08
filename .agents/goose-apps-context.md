# Goose Apps Extension — Référence compacte

## Architecture (Rust — `crates/goose/src/`)

```
goose_apps/
├── mod.rs               ← exports GooseApp, McpAppCache, WindowProps, McpAppResource
├── app.rs               ← GooseApp struct, from_html(), to_html()
├── cache.rs             ← McpAppCache (cache disque ~/.local/share/goose/apps/)
├── resource.rs          ← McpAppResource, CspMetadata, PermissionsMetadata, UiMetadata
└── clock.html           ← App par défaut embarquée avec include_str!

agents/platform_extensions/apps.rs ← Implementation MCP complète (tools + resources)
prompts/apps_create.md             ← System prompt pour création LLM
prompts/apps_iterate.md            ← System prompt pour itération LLM
```

## Format d'une Goose App (HTML + JSON-LD)

Chaque app est un fichier HTML unique avec métadonnées embarquées :

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Métadonnées GooseApp (OBLIGATOIRE) -->
  <script type="application/ld+json">
  {
    "@context": "https://goose.ai/schema",
    "@type": "GooseApp",
    "name": "nom-app",          // lowercase-kebab-case
    "description": "...",
    "width": 800,
    "height": 600,
    "resizable": true,
    "mcpServers": ["apps"]      // optionnel, hérité du stockage
  }
  </script>
  <!-- PRD embarqué (optionnel, pour itération LLM) -->
  <script type="application/x-goose-prd">
  # PRD de l'app...
  </script>
</head>
<body>...</body>
</html>
```

## 4 outils MCP exposés

| Tool | Paramètres | Description |
|---|---|---|
| `list_apps` | (aucun) | Liste toutes les apps stockées |
| `create_app` | `prd: string` | LLM génère (prompt apps_create.md) → sauvegarde → notification fenêtre |
| `iterate_app` | `name, feedback` | LLM améliore (prompt apps_iterate.md) → sauvegarde → notification fenêtre |
| `delete_app` | `name` | Supprime le fichier .html |

## Stockage

- **Linux/Mac** : `~/.local/share/goose/apps/<name>.html`
- **Windows** : `%APPDATA%\Block\goose\data\apps\<name>.html`
- Extension name: `"apps"`
- URI pattern: `ui://apps/<name>`
- MIME: `text/html;profile=mcp-app`

## Sandbox

- JS inline uniquement (strict CSP)
- Pas de dépendances npm
- Assets externes (fonts, icons, CSS) autorisés depuis CDNs de confiance
- Fenêtre standalone sandboxée, pas de bundler

## Génération LLM

- `create_app` utilise le prompt `apps_create.md` → appelle tool `create_app_content`
- `iterate_app` utilise le prompt `apps_iterate.md` → appelle tool `update_app_content`
- Réponses parsées via `extract_tool_response()` qui cherche le tool call dans la réponse LLM
- Vérification de troncature (output_tokens >= max_tokens → erreur)

---

# Plugin product-design (Goose Skills) — Référence compacte

## Emplacement

- Source (Codex) : `/home/jmercier/Codes/third-parties/role-specific-plugins/plugins/product-design/`
- Portage Goose : `/home/jmercier/Codes/product-design/`
- Licence : MIT (Copyright 2026 OpenAI)

## Structure du plugin Goose

```
product-design/
├── plugin.json                     ← Manifest Goose (name, version, description)
├── LICENSE                         ← MIT
├── README.md                       ← Documentation + dépendances
├── references/                     ← 4 fichiers racine
│   ├── communication-protocol.md   ← Ton design partner, pas technique
│   ├── critical-overrides.md       ← Règles qui override les defaults
│   ├── existing-codebase-edits.md  ← Pour édition de codebase existante
│   └── local-prototype-preflight.md← Preflight avant création prototype
├── scripts/
│   └── bootstrap-prototype.mjs     ← Clone template → set npm → set package name
├── templates/
│   └── prototype/                  ← Starter Vite + React
│       ├── package.json (vite 6.4, react 19.2, @vitejs/plugin-react 5.0)
│       ├── src/App.jsx, main.jsx, styles.css
│       ├── index.html
│       ├── vite.config.mjs
│       └── AGENTS.md              ← Instructions prototype
├── skills/
│   ├── index/SKILL.md             ← Routeur principal : dirige vers le bon skill
│   ├── get-context/SKILL.md       ← Clarifie le brief avant de build
│   ├── user-context/              ← Contexte utilisateur persistant
│   │   ├── SKILL.md
│   │   ├── references/onboarding.md
│   │   ├── scripts/init_user_context.py
│   │   ├── scripts/user_context_preflight.py
│   │   └── plugin-author-config/user-context-template.md
│   ├── ideate/SKILL.md            ← Génération de concepts visuels (Image Gen)
│   ├── audit/                     ← Audit UX/accessibilité
│   │   ├── SKILL.md
│   │   └── references/design-audit-framework.md
│   ├── image-to-code/SKILL.md     ← Implémentation à partir d'une image/mock
│   ├── url-to-code/SKILL.md       ← Clone une URL en prototype local
│   ├── design-qa/                 ← QA comparatif prototype vs source
│   │   ├── SKILL.md
│   │   └── references/qa-rubric.md
│   ├── research/SKILL.md          ← Recherche UX/ergonomie
│   └── share/SKILL.md             ← Déploiement du prototype
└── assets/
    ├── composerIcon.svg
    └── logo.png
```

## 10 Skills — Rôle + Routage

| Skill | Rôle | Routage index |
|---|---|---|
| `index` | Routeur principal — détecte l'intention et redirige | — |
| `get-context` | Clarifie le brief, capture le périmètre visuel | Avant ideate, image-to-code, url-to-code |
| `user-context` | Sauvegarde/lecture du contexte produit persistant | Setup, save, read |
| `ideate` | Génère des alternatives design via Image Gen | Demande de concepts/designs |
| `audit` | Capture et audite UX, design, accessibilité | Revue UX, critique |
| `image-to-code` | Implémente un mock/visuel en frontend | Build from image |
| `url-to-code` | Clone une URL en prototype local | Clone un site/URL |
| `design-qa` | Compare prototype vs source visuelle | QA, comparaison |
| `research` | Recherche UX sur produit existant | Recherche utilisateur |
| `share` | Déploie le prototype (Vercel, Sites...) | Partage, déploiement |

## Dépendances runtime

- **Playwright MCP** — capture de pages (audit, url-to-code, QA)
- **Image Gen tool** — génération de visuels (ideate, assets)
- **Node.js/npm** — bootstrap + dev server prototype
- **Python 3** — scripts user-context
- **Hosting** (Vercel, Sites) — share (optionnel)

## Workflow typique

1. `get-context` → clarifier le brief
2. `ideate` → générer des concepts (ou image-to-code / url-to-code directement)
3. `image-to-code` / `url-to-code` → builder le prototype avec `bootstrap-prototype.mjs`
4. `design-qa` → comparer prototype vs source
5. `share` → déployer

## Règles critiques (critical-overrides.md)

- Toujours matcher le design system existant, ne pas réinventer
- Utiliser `user-context` si disponible
- Parler comme un design partner (communication-protocol.md)
- Ne pas build under-spécifié : capturer la source visuelle d'abord
- Assets réels uniquement (pas de CSS art, div art, emoji, SVGs faits main)
- Après build : retourner lien prototype + "Let me know if I can tighten anything up"

## Prototype bootstrap

```bash
node /path/to/scripts/bootstrap-prototype.mjs --dest /path/to/new-prototype
cd /path/to/new-prototype && npm install && npm run dev
```

Le template Vite + React généré a `.npmrc` avec cache local. Ne pas remplacer par du HTML statique.

---

# Plugin product-design — État bead (bd)

## Tâches (toutes fermées ✅)

| ID | Tâche | Statut |
|---|---|---|
| `product-design-29u` | EPIC: Convertir Codex → Goose | ✅ Closed |
| `.1` | T1: Scaffold plugin.json + structure | ✅ Closed |
| `.2` | T2: Port skills index, get-context, user-context, ideate, audit | ✅ Closed |
| `.3` | T3: Port skills image-to-code, url-to-code, design-qa, research, share | ✅ Closed |
| `.4` | T4: Port scripts, templates, références, assets | ✅ Closed |
| `.5` | T5: Validation (goose-plugin-creator/validate) | ✅ Closed (OK) |

## Validation

`python3 /home/jmercier/.agents/skills/goose-plugin-creator/scripts/validate_goose_plugin.py .` → **OK** (seulement warnings pour AGENTS.md, CLAUDE.md — fichier beads)

---

# Notes de connexion Product-Design ↔ Goose Apps

- **Product-design** = skills système pour l'agent (instructions de travail)
- **Goose Apps** = plateforme d'exécution de mini-apps HTML sandboxées
- Pas de conflit : les prototypes product-design utilisent Vite+React, pas le format Goose Apps
- Possibilité future : créer un skill `product-design:quick-tool` qui génère des Goose Apps (mini-outils design HTML) comme alternative légère aux prototypes Vite
- Le format Goose App permet d'embarquer un PRD (`application/x-goose-prd`) pour itération LLM — intéressant pour du design itératif