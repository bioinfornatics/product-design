# Architecture MCP : Qdrant + Graph Explorer

> Design de l'infrastructure MCP pour `goose-graph-engineering`

---

## Principe : deux serveurs, deux responsabilités

```text
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

## Serveur 1 : Qdrant MCP (officiel)

- **Rôle** : porte d'accès mémoire standard pour Goose
- **Opérations** : `qdrant-find`, `qdrant-store`
- **Transport** : `stdio`, `sse`, `streamable-http`
- **Source** : [github.com/qdrant/mcp-server-qdrant](https://github.com/qdrant/mcp-server-qdrant)
- **Utilisation** : par Goose directement, pour des requêtes mémoire générales

## Serveur 2 : graph-explorer MCP (custom)

- **Rôle** : plan de contrôle de l'exploration agentique
- **Communication Qdrant** : via SDK direct (pas via le MCP Qdrant)
- **Pourquoi direct SDK** : éviter une couche réseau/protocole inutile entre deux MCP

### API exposée

| Opération | Description |
|-----------|-------------|
| `graph_create` | Créer un graphe d'exploration |
| `graph_plan` | Planifier les nœuds à explorer |
| `graph_frontier` | Récupérer la frontière d'exploration |
| `graph_add_evidence` | Ajouter une preuve à un nœud |
| `graph_get_context` | Récupérer le contexte consolidé d'un nœud |
| `graph_retry` | Marquer un nœud pour ré-exploration |
| `graph_complete` | Marquer l'exploration comme terminée |
| `memory_promote` | Promouvoir une trace en mémoire durable |
| `memory_forget` | Supprimer une trace inutile |

## Pourquoi deux MCP plutôt qu'un

```text
MCP Qdrant :  LLM → mémoire
SDK Qdrant dans Graph MCP : application → persistence
```

- Évite de mélanger les niveaux d'abstraction
- Qdrant reste remplaçable sans réécrire le Graph MCP
- Le Graph MCP expose des opérations **sémantiquement utiles**, pas des primitives de base de données

## Interactions MCP Roots

Goose supporte [MCP Roots](https://goose-docs.ai/docs/guides/mcp-roots/) :

```text
Goose session → MCP Root → /project/foo → Graph MCP
                                              │
                                       workspace_id = hash(root)
                                              │
                                       Qdrant filters workspace_id
```

Le workspace est automatiquement connu, sans le passer à chaque appel.

## MCP Sampling

Le Graph MCP peut demander des complétions au modèle Goose :

```text
Graph MCP → 15 evidence candidates → MCP Sampling
                                         ↓
                                  "rank according to objective"
```

Permet au serveur de rester déterministe tout en déléguant ponctuellement ranking/classification au LLM.

## Structure de données dans Qdrant

### Payload type

```json
{
  "workspace_id": "hash(/project/foo)",
  "project_id": "product-design",
  "graph_id": "g-123",
  "node_id": "explore-auth",
  "type": "evidence",
  "source": "src/auth/token.ts",
  "content": "...",
  "confidence": 0.87,
  "created_by": "explorer",
  "timestamp": "2026-08-14T11:00:00Z",
  "provenance": {
    "action": "semantic_search",
    "query": "authentication token refresh",
    "previous_node": null
  }
}
```

### Collections

| Collection | Contenu | Cycle de vie |
|-----------|---------|-------------|
| `memory` | Connaissances consolidées, généralisables | Permanent |
| `evidence` | Preuves collectées par les explorateurs | Jusqu'à clôture du graphe |
| `graph_state` | Nœuds, arêtes, état d'exploration | Jusqu'à clôture du graphe |
| `traces` | Traces d'exploration brutes | TTL (éphémère) |

### Cycle de vie de la mémoire

```text
exploration trace → evaluator → inutile → TTL/delete
                               → utile → episodic
                               → généralisable → semantic memory
```