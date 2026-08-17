# Agentic RAG vs GraphRAG : le débat

> **Papier** : [arXiv:2606.25656](https://arxiv.org/abs/2606.25656) — Is GraphRAG Needed? From Basic RAG to Graph-/Agentic Solutions with Context Optimization

---

## Conclusion principale

> Des variantes agentiques relativement simples peuvent obtenir de meilleurs résultats que des architectures GraphRAG plus sophistiquées.

## Le problème du GraphRAG statique

GraphRAG traditionnel :

```
documents → entités/relations → graphe → retrieval → LLM
```

Problème : **la structure décidée en amont ne correspond pas nécessairement à ce qu'il faudra explorer**.

GraphRAG essaie de construire une bonne carte avant de connaître le voyage.

L'exploration agentique construit son itinéraire pendant le voyage.

## Mais le graphe n'est pas à jeter

### GraphScout ([arXiv:2603.01410](https://arxiv.org/abs/2603.01410))

- Explore activement le graphe — choisit ses opérations et son chemin
- Qwen3-4B + GraphScout dépasse les baselines LLM plus puissants de **+16,7 %**
- Moins de tokens d'inférence

### Graph-R1 ([arXiv:2507.21892](https://arxiv.org/abs/2507.21892))

- Le retrieval devient une interaction multi-tour agent-environnement
- Optimisé par reinforcement learning
- Pas de récupération fixe exécutée une seule fois

## Synthèse

```diff
- Static GraphRAG
+ Agentic Graph Exploration
```

L'opposition utile n'est pas **Agentic Exploration vs GraphRAG** mais **Static GraphRAG vs Agentic Graph Exploration**.