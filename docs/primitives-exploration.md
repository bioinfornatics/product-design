# Primitives d'exploration agentique

> Les 4 opérations fondamentales qu'un explorateur agentique doit maîtriser.

---

## Les 4 primitives

| Primitive | Symbole | Comportement |
|-----------|:-------:|-------------|
| **Retrieve** | 🔍 | Récupérer directement de l'information pertinente |
| **Traverse** | 🔗 | Suivre une relation déjà connue |
| **Explore** | 🧭 | Décider dynamiquement où chercher ensuite |
| **Verify** | ✅ | Chercher à confirmer ou infirmer l'hypothèse actuelle |

## Exemple de boucle agentique

```
Question
   ↓
Hypothèse
   ↓
Retrieve
   ↓
Explore
   ↓
Nouvelle information
   ↓
Hypothèse mise à jour
   ↓
Traverse / Retrieve
   ↓
Verify
   ↓
Réponse
```

## Retrieve

Recherche directe : top-k, semantic search, grep, BM25.

- Entrée : requête textuelle, vecteur, ou filtre
- Sortie : documents, fichiers, ou passages pertinents
- Stratégie : BM25, embedding dense, Qdrant `query_points`

## Traverse

Navigation dans un graphe ou une structure de relations.

- Entrée : nœud courant, type de relation
- Sortie : nœuds voisins, dépendances, références
- Stratégie : dépendances de paquets, imports, références croisées, arbre d'appel

## Explore

Décision adaptative : où chercher ensuite ?

- Entrée : objectif + preuves actuelles + frontière d'exploration
- Sortie : prochaine action (chercher fichier, interroger web, inspecter historique)
- Stratégie : information gain, incertitude, gap d'évidence

## Verify

Recherche ciblée pour valider ou invalider une hypothèse.

- Entrée : hypothèse + preuves existantes
- Sortie : éléments confirmants/infirmants + confiance mise à jour
- Stratégie : recherche contradictoire, cross-check de sources, reproductibilité

## Mise en œuvre dans l'architecture

```
@explorer
   │
   ├── retrieve()    → Qdrant MCP : qdrant-find
   │                    Graph MCP : semantic_search
   │
   ├── traverse()    → Graph MCP : graph_get_children, follow_dependency
   │                    Outils : grep, file_tree
   │
   ├── explore()     → Graph MCP : graph_frontier, graph_candidates
   │                    Stratégie : information_gain, coverage, uncertainty
   │
   └── verify()      → Graph MCP : graph_get_context, graph_evidence
                         Stratégie : contradiction_search, cross_reference
```