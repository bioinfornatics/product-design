# SWE-Explore : Agentic Exploration > Static Retrieval

> **Paper** : [arXiv:2606.07297](https://arxiv.org/abs/2606.07297) — SWE-Explore: Benchmarking How Coding Agents Explore Repositories

---

## Résultat principal

L'exploration **agentique** surpasse nettement la recherche classique sur les dépôts de code.

### HitFile (précision au fichier)

| Approche | HitFile |
|----------|:-------:|
| BM25 | ~0,079 |
| TF-IDF | ~0,140 |
| Dense RAG | ~0,088 |
| **Agents généraux** (OpenHands, Mini-SWE-Agent, AweAgent, Claude Code, Codex) | **~0,645–0,682** |

Les auteurs : *"clear step above non-agentic retrieval"*

### Taux de résolution (downstream)

| Approche | Résolution |
|----------|:----------:|
| BM25 | 12,7 % |
| RAG dense | 23,3 % |
| Mini-SWE-Agent | 50,0 % |
| Codex | 50,3 % |
| Claude Code | 48,0 % |
| CoSIL | **59,3 %** |
| Oracle | 59,7 % |

### Le vrai bottleneck

| Métrique | Meilleurs agents |
|----------|:----------------:|
| **HitFile** (bon fichier) | ~0,667 |
| **Line recall** (bonne ligne) | ~**0,154** |

> Trouver la zone générale est facile ; **trouver l'évidence exacte reste difficile**.

Corrélation Context Efficiency / résolution : **Pearson = 0,950**

## Implications

```diff
- retrieval statique : requête → top-k → contexte
+ exploration adaptative : requête → inspecter → hypothèse → chercher → lire → réviser → sélectionner
```

L'adaptativité est le facteur différenciant, pas la structure de l'index.