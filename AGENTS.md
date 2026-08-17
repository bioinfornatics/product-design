# Product Design — Agentic System Context

> Philosophie, architecture, et références pour le développement agentique dans ce projet.

---

## 🧭 Philosophie générale

Ce projet construit une infrastructure d'**exploration agentique** centrée sur le **Product Design**, en opposition à une approche purement GraphRAG statique.

Le principe directeur est :

> **Une architecture qui apprend à explorer dynamiquement l'espace d'information peut être plus puissante qu'une architecture qui se contente d'effectuer un retrieval sur une structure préparée à l'avance.**

Cette position est soutenue par des résultats récents (voir la section [Références](#références)) montrant que l'exploration adaptative surpasse significativement la recherche statique — jusqu'à **~50-59 % de résolution vs ~12-23 % pour le RAG/BM25** sur des tâches complexes.

---

## 📐 Évolution du curriculum

Le modèle historique :

```
Prompt Engineering → Context Engineering → RAG → GraphRAG → Agentic RAG
```

La recherche récente suggère plutôt une **bifurcation** :

```
                    Context Engineering
                           │
              ┌────────────┴────────────┐
              ↓                         ↓
        Static Retrieval         Agentic Exploration
              │                         │
         RAG / GraphRAG         Search / inspect / act
              │                         │
              └────────────┬────────────┘
                           ↓
                  Agentic Graph RAG
                           ↓
                 Learned Exploration
                           ↓
              self-optimizing retrieval
```

Le concept supérieur devient **Exploration Engineering** — non plus « quelles informations récupérer ? » mais **« quelle prochaine action réduira le plus mon incertitude ? »**

### Primitives d'exploration

| Primitive  | Comportement |
|------------|-------------|
| **Retrieve**  | Récupérer directement de l'information pertinente |
| **Traverse**  | Suivre une relation déjà connue |
| **Explore**   | Décider dynamiquement où chercher ensuite à partir des résultats précédents |
| **Verify**    | Rechercher des éléments qui confirment ou infirment l'hypothèse actuelle |

Un agent puissant alterne les quatre :

```
Question → Hypothèse → Retrieve → Explore → Nouvelle info → Hypothèse mise à jour → Traverse / Retrieve → Verify → Réponse
```

---

## 🏗️ Architecture du plugin `goose-graph-engineering`

### Composants

**4 skills** (la procédure que l'agent sait appliquer) :

- `goose-graph-engineering:graph-orchestrator`
- `goose-graph-engineering:agentic-exploration`
- `goose-graph-engineering:qdrant-memory`
- `goose-graph-engineering:graph-evaluation`

**4 custom agents** (qui travaille) :

- `@graph-architect`
- `@explorer`
- `@memory-curator`
- `@graph-evaluator`

### Flux général

```
User request
     │
     ▼
@graph-architect
     │
     ▼
graph-orchestrator
     │
     ├──────────────┐
     ▼              ▼
@explorer        @explorer
     │              │
     ├── tools      ├── code/files
     ├── web        ├── dependencies
     └── Qdrant     └── Qdrant
          │
          ▼
     synthesis
          │
          ▼
 @graph-evaluator
       │       │
     accept   retry
               │
               └──► targeted node only
```

### Rôle de Qdrant

Qdrant est utilisé comme **moteur de persistance et mémoire d'exploration**, pas comme GraphRAG central. Le flux :

```
agentic exploration
        │
        ├── inspect current evidence
        ├── query Qdrant
        ├── formulate hypothesis
        ├── acquire new evidence
        ├── verify
        └── persist useful discoveries
```

**4 collections distinctes** (pas une collection unique) :

| Collection | Rôle |
|-----------|------|
| `memory` | Mémoire sémantique consolidée |
| `evidence` | Preuves collectées par les explorateurs |
| `graph_state` | Nœuds et état du graphe d'exploration |
| `traces` | Traces d'exploration (éphémères, TTL) |

**3 niveaux de mémoire :**

1. **Working memory** — mémoire du graphe/session courant (L1)
2. **Episodic memory** — anciennes explorations réutilisables (L2)
3. **Semantic memory** — connaissances consolidées et généralisables (L3)

L'évaluateur décide du niveau de promotion :

```
exploration trace → evaluator → inutile → TTL/delete
                               → utile → episodic
                               → généralisable → semantic memory
```

---

## 🔗 Architecture MCP

Deux serveurs MCP distincts, avec des responsabilités séparées :

```
                         Goose
                           │
             ┌─────────────┴─────────────┐
             │                           │
       Graph skills                Custom Agents
             │                           │
             └─────────────┬─────────────┘
                           ▼
                 graph-explorer MCP
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
   Qdrant MCP/API      Developer MCP      Web/Search
          │
          ▼
   Remote Qdrant
```

### 1. Qdrant MCP officiel

- **Porte d'accès à la mémoire** pour Goose et les agents
- Opérations : `qdrant-find`, `qdrant-store`
- Transport : `stdio`, `sse`, ou `streamable-http`
- Configurable via `QDRANT_URL` / `QDRANT_API_KEY`

### 2. `graph-explorer-mcp` (personnalisé)

- **Plan de contrôle de l'exploration**
- Utilise le SDK Qdrant directement (pas via le MCP Qdrant)
- Opérations exposées :

```
graph_create           — Créer un graphe d'exploration
graph_plan             — Planifier les nœuds à explorer
graph_frontier         — Récupérer la frontière d'exploration
graph_add_evidence     — Ajouter une preuve à un nœud
graph_get_context      — Récupérer le contexte consolidé d'un nœud
graph_retry            — Marquer un nœud pour ré-exploration
graph_complete         — Marquer l'exploration comme terminée
memory_promote         — Promouvoir une trace en mémoire durable
memory_forget          — Supprimer une trace inutile
```

### Pourquoi deux MCP plutôt qu'un ?

- **Évite de mélanger les niveaux d'abstraction**
- Le Qdrant MCP reste remplaçable
- Le Graph MCP voit des opérations sémantiquement utiles, pas des primitives de base de données
- Goose peut utiliser Qdrant MCP directement pour les opérations générales

### Interaction avec MCP Roots

Goose supporte **MCP Roots** — le serveur Graph MCP peut connaître automatiquement le workspace actif de la session, évitant de passer le chemin à chaque appel :

```
Goose session → MCP Root → /project/foo → Graph MCP
                                              │
                                       workspace_id = hash(root)
                                              │
                                       Qdrant filters workspace_id
```

### MCP Sampling

Le Graph MCP peut utiliser **MCP Sampling** pour demander des classements ou décisions au modèle Goose sans gérer d'API externe :

```
Graph MCP → 15 evidence candidates → MCP Sampling
                                         ↓
                                  "rank according to objective"
```

---

## 📂 Structure du bundle

```
.agents/
├── plugins/
│   └── goose-graph-engineering/
│       ├── plugin.json
│       ├── skills/
│       │   ├── graph-orchestrator/
│       │   ├── agentic-exploration/
│       │   ├── qdrant-memory/
│       │   └── graph-evaluation/
│       ├── hooks/
│       │   └── hooks.json
│       └── scripts/
│           └── setup_collection.py
│
├── agents/
│   ├── graph-architect.md
│   ├── explorer.md
│   ├── memory-curator.md
│   └── graph-evaluator.md
│
├── .env.example
├── install.sh
└── README.md
```

### Hooks disponibles

| Hook | Rôle | Activé par défaut |
|------|------|:---:|
| `AfterFileEdit` | Indexe les fichiers modifiés dans Qdrant | Non (`GRAPH_QDRANT_INDEX_EDITS=0`) |
| `PostToolUse` | Enregistre des traces compactes dans la mémoire | Oui |
| `PostToolUseFailure` | Enregistre des traces d'échec | Oui |
| `PreToolUse` | Policy guard (bloque `sudo`, `rm -rf /`) | Oui |

---

## 🧪 Bottleneck connu

Les résultats de SWE-Explore montrent que :

```text
Trouver la zone générale     ██████████████   (HitFile ~0,667)
Trouver l'évidence exacte    ███               (line recall ~0,154)
```

Le bottleneck n'est donc plus **« trouver le document »** mais **« explorer efficacement l'espace informationnel à l'intérieur et entre les documents »**.

C'est exactement là où l'approche agentique apporte le plus de valeur : la précision descendante (file → line) est une faiblesse que le bouclage agentique (inspecter → hypothèse → vérifier → affiner) peut adresser.

---

## 🔬 Références

| Papier | Lien | Contribution |
|--------|------|-------------|
| **SWE-Explore** (2026) | [arXiv:2606.07297](https://arxiv.org/abs/2606.07297) | L'exploration agentique surpasse nettement la recherche classique (BM25, TF-IDF, RAG dense) sur les dépôts de code. HitFile ~0,68 vs ~0,14. Résolution 50-59 % vs 12-23 %. |
| **Agentic RAG vs GraphRAG** (2026) | [arXiv:2606.25656](https://arxiv.org/abs/2606.25656) | Des variantes agentiques simples peuvent surpasser des architectures GraphRAG sophistiquées. Un retrieval plus large n'améliore pas proportionnellement la génération. |
| **GraphScout** (2026) | [arXiv:2603.01410](https://arxiv.org/abs/2603.01410) | Explore activement le graphe plutôt que d'effectuer un retrieval fixe. Un Qwen3-4B + GraphScout dépasse les baselines LLM plus puissants de +16,7 %. |
| **Graph-R1** (2025) | [arXiv:2507.21892](https://arxiv.org/abs/2507.21892) | Le retrieval devient une interaction agent-environnement multi-tour, optimisée par RL. |
| **Youtu-GraphRAG** (2026) | [Paper Digest](https://r9-hu.github.io/paper-digest/agentic-ai/2026/papers/youtu-graphrag-vertically-unified-agents-for-graph-retrieval-augmented-complex-r/) | Des retrievers agentiques capables de décomposer les questions, choisir les opérations de graphe et réfléchir sur les résultats. |
| **Qdrant MCP Server** | [GitHub](https://github.com/qdrant/mcp-server-qdrant) | Serveur MCP officiel pour Qdrant, utilisé comme couche d'accès mémoire standard. |

---

## ⚙️ Configuration

```bash
# Dans .env ou config Goose
QDRANT_URL=https://your-qdrant-instance:6333
QDRANT_API_KEY=your-api-key
QDRANT_MODEL=qdrant/bm25
QDRANT_VECTOR_NAME=content-bm25
GRAPH_QDRANT_INDEX_EDITS=0
```

### Installation

```bash
# Créer la collection Qdrant
python .agents/plugins/goose-graph-engineering/scripts/setup_collection.py

# Installer le bundle
bash .agents/install.sh
```