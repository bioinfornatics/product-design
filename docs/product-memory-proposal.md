# Proposition — Mémoire produit locale et cohérence dans le temps

Statut : **proposition d’architecture, non implémentée et non activée**. Date : 2026-10-19.

Ce document compile la discussion sur la vision, les spécifications, les intentions, les écrans et leur maintenance. Il ne remplace pas les contrats actuels, ne crée pas de dossier produit opérationnel, ne migre aucune preuve, ne configure aucun hook et n’autorise ni production ni déploiement.

## Révision par soustraction — statut des options

[Proposition minimale — spécifications produit, mémoire de travail Beads et provenance Entire facultative](product-memory-read-write-review.md) est désormais la référence. Elle retire du socle tout registre de tâches, journal de changements ou graphe déjà fourni par ces outils ; seules les références entre autorités et leurs contrôles manquants sont proposées. Pas de catalogue auteur, requirements, relations, scope ou baseline obligatoire sans consommateur concret. Les listes ci-dessous sont un inventaire historique d’options, pas un socle à implémenter. Les contrats existants restent pour compatibilité, sans considérer leurs chevauchements comme résolus. Aucun parser, tracker, adapter Entire/Goose, hook ou migration n’est activé.

## Précision des schémas et corrections

[Schémas, lecteurs et cause → effet](product-memory-schemas.md) précise les formats proposés et ceux déjà implémentés. L’index est un catalogue d’autorités ; hashes, graphe et fraîcheur sont dérivés. Un `relations.json` optionnel ajoute seulement les liens absents des contrats. La validation des brouillons est séparée de celle des transitions : conserver une question ouverte ne doit pas fabriquer readiness. La révision directory-first retire `project.json` du socle : racine reçue à l’exécution, aucun choix de modèles ni configuration d’hôte dans la mémoire produit. Ces précisions restent une proposition, sans changement de runtime.

## 1. Décision recommandée

Adopter **un dossier `.product-design/` à la racine du projet produit**, lisible par les personnes, exploitable par les agents et vérifiable indépendamment de la conversation.

Conserver les sept rubriques proposées : cadre → service → personas → parcours → intentions → écrans → validation. Elles constituent une **grille de lecture**, pas sept étapes obligatoires ni sept modèles concurrents. Ajouter trois dimensions transversales : décisions, changements et liens d’implémentation.

Déplacer à terme les décisions de phase dans ce dossier : **pas de `.gates/` supplémentaire à la racine du projet cible**. Conserver les contrôles et l’historique : changer l’emplacement ne signifie pas supprimer les garde-fous.

Principe : **les skills produisent le sens ; les scripts contrôlent les dépendances ; les hooks signalent certains événements ; les responsables et les workflows autorisés décident**.

La cible n’est pas « sauvegarder la conversation ». C’est retrouver plusieurs mois plus tard : pourquoi le produit et chaque écran existent, pour qui, avec quelle intention, sur quelles preuves, ce qui a été décidé/construit/testé séparément, ce qui devient à revoir et qui doit intervenir.

## 2. Existant vérifié et écarts

Réutiliser les contrats actuels, pas les doubler.

| Sujet | Existant | Évolution proposée |
|---|---|---|
| Problème, valeur, invariants, responsabilités, scénarios et UI | [Design contract](../references/design-contract.md), JSON v1 | Conserver sa responsabilité et ses validateurs |
| Entrées, questions, décisions, états et vérifications | [Experience blueprint](../references/product-experience-method.md), JSON v1 | Conserver comme registre structuré de traçabilité |
| Spécifications, révisions, sources visuelles et tentatives | [Source artifacts](../references/source-artifacts.md) | Relier le dossier produit, préserver la provenance |
| Artefact visuel faisant autorité | [Artifact index](../references/artifact-index.md) | Une autorité par usage et périmètre |
| Phases et QA | [Executable transitions](../references/executable-transitions.md) | Migrer chemins et isolation par scope, pas les garanties |
| Préférences personnelles | [User context](operations.md#user-context), hors projet | Valeurs par défaut, pas autorité métier locale |
| Feedback dans le prototype | `.goose/annotations/` | Relier la synthèse utile au changement ; migrer le transport séparément |
| Hooks | Aucun déclaré dans `plugin.json` ; [propositions](instruction-reliability-proposals.md) | Opt-in et observation d’abord |
| Cohérence après livraison | Fraîcheur aux transitions | Baselines, changements, écarts et résultats observés |

L’adaptateur écrit actuellement reçus/archives sous `.gates/` et impose `design-qa.json` à la racine. Le générateur impose `generated/product-design/...` sous sa base projet. L’annotation utilise `.goose/annotations/`. **Centraliser complètement demande une migration de code et de contrats, pas un déplacement de fichiers.** G6/G7, production et hosting restent hors de l’adaptateur actuel.

## 3. Challenge de l’arborescence et des automatismes

| Proposition | Apport | Risque | Arbitrage |
|---|---|---|---|
| Dossier caché unique | Racine propre, mémoire liée au produit | Caché ne signifie ni ignoré par Git ni confidentiel ; recherches parfois incomplètes | Versionnement explicite et lecture par index |
| Sept rubriques numérotées | Lecture Product → UX → UI | Waterfall, dossiers vides, duplication | Lecture logique, création proportionnée au périmètre |
| Markdown + JSON/YAML | Raisonnement et automatisation | Deux vérités concurrentes | Autorité par information, projection unidirectionnelle |
| Personas | Responsabilités visibles | Profils fictifs traités comme recherche | Provenance, service partagé, parcours communs |
| Intentions séparées | Besoin distinct de la solution | Même action décrite trois fois | IDs partagés et liens, pas copies |
| Écrans ASCII | Discussion fonctionnelle diffable | Fausse approbation visuelle | Facultatifs, jamais source visuelle éligible au build |
| Hooks de maintenance | Réaction rapide | Événements manqués, boucles, fausse sécurité | Accélérateurs, reconcile/CI nécessaires |
| Suivi après build | Apprentissage conservé | Vision déduite du code, bénéfices inventés | Séparer cible, implémentation et observation |

SDD est interprété ici comme **Specification-Driven Development**, hypothèse de terminologie à confirmer. Retenir « spécification vivante et traçable », pas « une spécification est forcément vraie » ni « tout code est généré ».

## 4. Arborescence cible

Exemple dans **un projet produit**, pas une instruction de créer ces dossiers dans le dépôt du plugin :

```text
<projet>/
├── .product-design/
│   ├── README.md                         # Entrée humaine, règles et prochaine action
│   ├── index.json                        # Inventaire des autorités/périmètres, pas leur contenu
│   ├── specifications/
│   │   ├── requirements.json             # Besoins, règles, contraintes et critères : IDs stables
│   │   └── experience/
│   │       ├── design-contract.json      # Contrat existant, autorité structurée
│   │       ├── experience-blueprint.json # Blueprint existant, autorité de traçabilité
│   │       ├── 00-cadre/                 # Vision, valeur, principes, sources
│   │       ├── 01-service/               # Objets, périmètres, responsabilités, passages
│   │       ├── 02-personas/              # Intentions, contexte, attentes et niveau de preuve
│   │       ├── 03-parcours/              # Déclencheur, résultat, branches et couverture
│   │       ├── 04-intentions/            # Comprendre/décider/agir, effets, états et reprises
│   │       ├── 05-ecrans/                # Fiches fonctionnelles ; ASCII facultatif
│   │       └── 06-validation/            # Hypothèses, critères, protocoles et vues de traçabilité
│   ├── decisions/                        # ADR produit/UX/UI, alternatives et justification
│   ├── changes/                          # Demandes, impacts, résolutions, responsables
│   ├── implementation/
│   │   └── bindings.json                 # IDs ↔ routes, composants, tests, cibles
│   ├── scopes/
│   │   └── <scope-id>/
│   │       ├── scope.json                # Tranche, cible, limites, phase et propriétaires
│   │       ├── sources/                  # Plans, manifests, registres et index visuel
│   │       ├── gates/                    # Requêtes et décisions G1–G5
│   │       ├── receipts/                 # Reçus par opération, isolés par périmètre
│   │       └── validation/               # QA canonique, résultats et références aux captures
│   ├── evidence/                         # Preuves sélectionnées, classifiées et versionnées
│   ├── generated/                        # Sorties canoniques si le workspace outil le permet
│   │   └── product-design/<journey>/<session>/<variant>/...
│   ├── history/                          # Baselines et transactions/preuves immuables
│   └── runtime/                          # Ignoré par Git : verrous, cache, diagnostics expurgés
└── <code applicatif existant ou app/>
```

Créer seulement les artefacts nécessaires. Une découverte courte peut commencer avec un brief, un index minimal et README ; pas de faux G4, d’écrans fictifs ou de contrats vides pour remplir les dossiers. Les schémas sont fournis/versionnés par le plugin, pas recopiés en versions divergentes.

Les parcours sont partagés : une persona référence ses parcours, sans dupliquer les étapes. Un écran peut servir plusieurs responsabilités et états. Une variante de design n’est pas un nouveau besoin métier.

### Trois racines à distinguer

- **PROJECT_ROOT** : dépôt/application ; base des liens vers le code et limites de sécurité.
- **PD_ROOT** : `PROJECT_ROOT/.product-design` ; stockage produit.
- **IMAGE_WORKSPACE_ROOT** : base effectivement configurée dans l’outil d’image.

Ces racines sont **résolues à l’exécution**, pas enregistrées dans project.json. PROJECT_ROOT provient du contexte de répertoire établi ; PD_ROOT est conventionnel. Index : références relatives des dépendances, pas localisation du workspace. Chemins de code dans bindings/G4, pas inventaire global redondant. Ambiguïté monorepo/sous-projet : clarification, jamais changement silencieux de racine.

Centraliser les nouvelles images suppose que l’outil puisse utiliser **PD_ROOT comme workspace** et que le source adapter distingue cette base de PROJECT_ROOT. Les chemins des spécifications restent relatifs à PROJECT_ROOT ; les images seraient sous PD_ROOT/generated/. L’alignement doit être vérifié, jamais supposé.

Si impossible : conserver l’emplacement canonique existant et le référencer, en signalant **centralisation stricte bloquée**. Pas de copie post-génération présentée comme provenance originale, de symlink de contournement ou de double préfixe generated/. Centraliser le sens peut précéder la migration du transport.

## 5. Autorité et formats

Ne pas alterner arbitrairement : choisir selon le rôle.

| Information | Autorité | Autre format |
|---|---|---|
| Vision, raisonnement, ADR, hypothèses argumentées | Markdown rédigé, métadonnées minimales | Index de liens/dépendances, pas résumé concurrent |
| Règles et critères contrôlables | JSON typé | Markdown généré pour lecture/revue |
| Contrat et blueprint existants | JSON selon schémas actuels | Vues générées ; prose complémentaire explicitement référencée |
| Plans sources, approbations, QA, résultats typés | JSON versionné | Rapports dérivés non éditables indépendamment |
| Graphe cache, fraîcheur et reprise | Données dérivées | Régénérables, jamais autorité d’approbation |

**JSON pour les contrats exécutables en première version.** Réutiliser les validateurs existants. YAML peut venir ensuite comme format d’auteur : sous-ensemble strict, clés dupliquées/tags exécutables interdits, conversions implicites ambiguës refusées et normalisation déterministe. Jamais `x.yaml` et `x.json` tous deux éditables et faisant autorité.

Les faits sur responsabilités/scénarios/états restent dans contrat/blueprint ; les sept rubriques expliquent leurs raisons ou présentent des vues. Un ADR approfondit une décision, sans porter une deuxième copie indépendante de son statut. Un mapping relie ADR et décision du blueprint.

Ne pas ajouter silencieusement des champs aux schémas v1. Les métadonnées de cycle de vie et nouveaux liens vont d’abord dans des **sidecars/enveloppes versionnés**. Toute extension est une migration testée. Un futur compilateur à partir des sept rubriques serait une alternative plus lourde, pas une deuxième écriture simultanée.

### Métadonnées minimales proposées

Une entité matérielle possède ID stable, type, emplacement d’autorité, scope, responsable, révision et liens utiles. Les faits issus d’une source portent provenance et date pertinente. Utiliser les IDs, pas les positions de tableaux ou les numéros de dossiers.

Un besoin conserve problème/contexte, résultat, raison, source et critères. Une décision conserve alternatives rejetées, compromis, propriétaire et conditions de réexamen. Distinguer **besoin**, **règle métier**, **contrainte**, **critère** et **solution** : « afficher un tableau » n’est pas le besoin « choisir le dossier à traiter ».

L’index inventorie fichiers et IDs ; contrôler aussi les fichiers présents non déclarés et les autorités en doublon. Ne pas dépendre d’une recherche qui ignore les dossiers cachés.

## 6. Contenu des sept niveaux

### 00 — Cadre

Pourquoi maintenant, public/responsabilité, problème, fréquence connue/inconnue, alternative actuelle, valeur, résultat observable, horizon, limites et non-objectifs. Principes SDD, contraintes d’adoption/viabilité, coût de l’échec. Sources et hypothèses distinguées ; quels éléments feraient changer ou arrêter la direction ? **La vision doit permettre de refuser une fonctionnalité.**

### 01 — Service

Objets métier, vocabulaire, cycle de vie, visibilité, périmètres et invariants. Responsabilité de chaque action, passage entre acteurs, information/preuve transmises, prochaine responsabilité et reprise d’un passage défaillant. Données connues/estimées/inconnues et frontières de permission. Décrire le service n’autorise pas à créer backend, rôles techniques ou API de production.

### 02 — Personas

Responsabilité, objectif, contexte, alternative actuelle, intentions, attentes, difficultés, coût de l’erreur et sources. Profils complémentaires, pas caricatures démographiques. Persona hypothétique identifié ; absence de recherche non maquillée en connaissance utilisateur.

### 03 — Parcours

Déclencheur, contexte initial, étapes, branches, handoffs, résultat prouvé, erreurs critiques et reprise. Carte de couverture covered/deferred/out-of-scope avec raison. Une tranche de prototype ne couvre pas tout le produit.

### 04 — Intentions

Distinguer intention utilisateur (« choisir le dossier »), intention de conception (« présenter sa cause avant les métriques ») et effet système (« ouvrir le dossier », pas « résoudre le problème »).

Pour chaque intention : question, information, action directe et éventuellement conversationnelle, effet none/internal/external, autorité, état avant/après, preuve du résultat, annulation/reprise et contexte préservé. Inclure loading/vide/inconnu/partiel/erreur/révocation/réponse tardive lorsque pertinents.

Les intentions existent sans IA. Le champ conversationnel `intents` actuel est conditionnel : ne pas forcer un agent sur tous les produits. Les intentions générales se relient aux questions/scénarios/états via sidecar au besoin.

### 05 — Écrans

Raison d’être, rôles, moment du scénario, intentions, contenu, hiérarchie, action principale, effet, états, navigation, retour au contexte, règles et tests liés. Source approuvée, route implémentée et preuve de test sont **trois références distinctes**.

**ASCII uniquement comme documentation fonctionnelle facultative**, marqué « non visuel / non éligible au build ». Ne remplace pas une source graphique choisie, ne simule pas un asset/logo, ne valide ni pixels ni responsive. Cette distinction devra être intégrée explicitement aux instructions lors de l’implémentation ; les garde-fous actuels sur les assets restent applicables.

### 06 — Validation

Hypothèse, alternative/baseline, résultat, guardrails, protocole, propriétaire, population/contexte, accès/consentement et règle continuer/changer/arrêter. Critères liés aux états et preuves. Inconnues conservées, aucun seuil inventé pour passer un gate.

Séparer contrôles structurels, revue source, comparaison rendue, tests d’interaction, accessibilité, recherche utilisateur et résultats opérationnels. Un protocole n’est pas une étude menée ; une approbation n’est pas une mesure de valeur.

## 7. Graphe de traçabilité et analyse d’impact

Un **graphe de références sur fichiers**, pas une nouvelle base obligatoire :

```text
Source / feedback → question → besoin / règle → décision
  → responsabilité / scénario → intention → écran / état
  → source visuelle → route / composant → vérification → résultat
```

Les liens distinguent justification, dépendance, implémentation et vérification ; tous ne propagent pas le même impact. Cycles de parcours normaux ; cycles de dérivation rejetés. Tombstones et supersededBy pour les entités retirées, jamais réutilisation d’ID.

### Algorithme cible

1. Comparer les fichiers réels à la baseline, **ajouts/suppressions inclus**, y compris hors agent.
2. Marquer changed les autorités modifiées.
3. Traverser les dépendances inverses pertinentes ; descendants needs-review avec cause et versions.
4. Produire l’impact : décisions, scénarios, écrans, tests et autorisations concernés.
5. Faire décider materially-changed/no-semantic-impact/deferred avec raison et responsable.
6. Corriger/reverifier le périmètre affecté puis publier une nouvelle baseline.

Hash différent = identité changée, **pas intention métier forcément changée**. L’automate propage une suspicion, pas une conclusion sémantique. Commencer au niveau fichier avec IDs existants. Un gros blueprint peut invalider largement ; une future projection par entité/JSON pointer doit être déterministe/versionnée et ne contourne jamais les empreintes intégrales exigées aujourd’hui.

Une dispense documentée n’efface pas le changement : les reçus liant d’anciens octets doivent être republiés selon les règles applicables. Les dépendances non déclarées ne sont pas détectables par magie. Un fichier de code non lié dans les racines surveillées crée une alerte de couverture/impact conservateur, pas « rien d’affecté ». Sources externes : révision/export/lockfile et revue de fraîcheur, pas scraping dans chaque hook.

## 8. Statuts indépendants et baselines

Ne pas réduire tout à ready.

| Dimension cible | Valeurs proposées | Ne prouve pas |
|---|---|---|
| Décision | draft, proposed, accepted, rejected, superseded | Besoin vrai, bénéfice mesuré |
| Exécution | not-started, in-progress, implemented, retired | Fidélité, sécurité vérifiée |
| Vérification | not-run, passed, failed, blocked | Étude utilisateur conduite |
| Fraîcheur | current, needs-review, stale, unknown | Pertinence métier |
| Preuve | assumption, stakeholder, source-review, user-observed, operational | Autorité humaine authentifiée |

Métadonnées cibles, **pas remplacements des enums actuels**. Une décision peut être acceptée, implémentée, à revoir et jamais testée auprès d’utilisateurs.

Une baseline fige scope, versions des autorités, sources, bindings, preuves et limites. Publiée, elle ne change plus. Chaque résultat mentionne la version testée. Séparer **expérience cible**, **implémentation constatée** et **résultat observé** ; le code ne réécrit pas automatiquement la cible.

Revues périodiques : hypothèses non testées, observations contraires, alternatives, règles/droits/sources, dette UX, exceptions et écarts. Cadence/échéances selon risque ; échéance dépassée = revue due, pas réfutation automatique. Dérogations : scope, owner, raison, échéance et réexamen.

## 9. Workflow durable

### A. Reprise sans conversation

Résoudre racines/identité/layout → lire README/index/scope/baseline → réconcilier fichiers et transactions interrompues → suivre les liens utiles → exposer contradictions/inconnues/prochaine action → continuer le skill spécialisé. Pas de chargement intégral des archives.

Un résumé dérivé accélère la reprise sans faire autorité. **Aucun hook ne garantit à lui seul l’injection de son stdout dans le contexte du modèle** ; la lecture explicite appartient au skill. Une information importante jamais enregistrée reste non récupérable.

### B. Découverte sans build

Enregistrer problème/vision/alternatives/preuves → expliciter inconnues → test ou décision différer/changer/arrêter. Pas de faux gate de build. Créer un dossier d’évidence n’autorise pas à scaffolder.

### C. Nouvelle expérience

Brief/G1 applicable → trois parcours complets comparables ou trois directions pour écran réellement isolé → sélection G2 → sources corrigées/ensemble approuvé G3 → scope prototype G4 → build → comparaison/vérifications G5.

Les branches source fournie, clone exact et sélection historique restent explicites. Ni nouvelle compétition pour une direction choisie, ni images obligatoires pour une recherche sans interface.

### D. Changement après livraison

Signal → change record → impact → arbitrage → autorités mises à jour → approbations affectées renouvelées → implémentation autorisée → vérifications → baseline → observation.

Deux entrées : **spec-first** (règle changée) et **code-first** (hotfix/modification externe constatée). En code-first, conserver observed-vs-target et décider : corriger code, amender spec ou exception temporaire. Jamais approbation rétroactive déduite du code. Une direction existante n’exige pas automatiquement trois nouvelles alternatives ; effet/parcours/source matériellement modifié exige sa revue adaptée.

### E. Apprentissage dans le temps

Relier support/audit/mesures autorisées à la version évaluée. Résultats confortant/contredisant/laissant indécise l’hypothèse ; réviser vision/parcours si nécessaire. Conserver non-objectifs et raisons d’abandon. Ni télémétrie, ni backend, ni production/déploiement ajoutés implicitement pour le suivi.

## 10. Hooks : usages judicieux et limites réelles

Les hooks Goose exécutent des commandes locales lors d’événements de session. **Ni watcher permanent, ni ordonnanceur, ni service mémoire, ni autorité produit.** Hors session : reconcile explicite, CI ou ordonnanceur distinct expressément autorisé.

| Événement | Usage cible après opt-in | Limite |
|---|---|---|
| SessionStart | Vérifier association session/projet si disponible, préparer reprise bornée | Cache/diagnostic ; aucun projet déduit aveuglément |
| AfterFileEdit | Marquer dirty les autorités/racines de code surveillées | Invalidation idempotente, observation-only |
| PostToolUse | Relier résultat technique à transaction connue | Succès outil ≠ résultat produit |
| PostToolUseFailure | Garder échec et transaction à reprendre | Pas de faux résultat ni effacement de preuve |
| PreToolUse | Vérifier transition explicitement identifiée et reçu frais | Refus ciblé ; notes/recherche/réparation permises |
| PreToolUseResult | Observer allow/deny/cause si hôte compatible | Optionnel, livraison non durable |
| Stop | Au plus un contrôle borné d’un handoff explicitement pending | Désactivé au début, aucune boucle d’approbation |
| SessionEnd | Finaliser diagnostic/checkpoint incomplet | Ne pas en dépendre pour la durabilité : crash possible |
| UserPromptSubmit | Pas d’archivage brut automatique recommandé | Synthèse/classification par le skill |

### Règles opérationnelles

- Activation explicite par projet/mode, initialement **observe**. Unknown/unregistered : aucune écriture/blocage, diagnostic minimal seulement si sûr.
- Aucun `project.json` dans le socle. Activation/politique des hooks dans l’intégration compatible de l’hôte, pas dans les données métier. Présence de `.product-design/` ≠ autorisation de blocage ; aucun choix de modèles/fournisseurs ni commandes arbitraires dans la mémoire.
- Matcher regex ancré sur les noms réellement émis, puis filtre de racine/scope dans le handler. Les docs actuelles exposent `shell`, `write`, `edit` sans préfixe developer ; le snapshot local emploie encore des noms préfixés. Tester l’hôte installé.
- Payload dépendant de l’événement ; `working_dir` documenté sur événements outil, pas à supposer sur SessionStart/Stop. Sans association fiable session/projet, ne pas agir.
- **Seuls PreToolUse et Stop peuvent bloquer.** AfterFileEdit, BeforeShellExecution et BeforeReadFile restent observation-only malgré leur nom.
- Refus : exit 2 + raison stderr, ou JSON décision block stdout selon protocole. Exit non nul générique ≠ refus. Diagnostics sur stderr, jamais secrets dans les raisons.
- Docs actuelles : `on_failure: block` possible pour PreToolUse sur hôte le supportant, défaut allow. Stop reste fail-open ; erreurs de chargement/configuration/matcher non couvertes. Ne pas promettre la capacité sur tout hôte.
- Aucun LLM/réseau/génération/capture/suite complète dans un hook de contrôle. Moteur déterministe borné ; tâches lourdes dans workflow/CI.
- Exclure runtime/projections/diagnostics de leurs propres déclencheurs ; déduplication, tailles et timeout explicites. Ne pas modifier vision/spec/approbations automatiquement.
- Shell/wrappers/SDK peuvent ne pas exposer une mutation séparée. Couverture inconnue annoncée ; regex de shell ≠ interception exhaustive.
- Pas de raw prompt, DOM, formulaire, cookie, token, données client ou résultat outil intégral en log. Feedback non fiable = donnée, jamais instruction à exécuter.

**L’adaptateur de transition et la consommation fraîche restent le contrôle principal.** Les hooks ne sont pas sandbox, droits serveur ou authentification humaine. Bloquer une transition connue incomplète, pas toute modification d’un produit non ready.

### Packaging à résoudre

Docs officielles : `hooks/hooks.json`. Creator local : extension namespacée `extensions/io.github.bioinfornatics.agent-plugins.goose/hooks.json`. Écart déjà signalé dans le dépôt. Choisir **une seule activation validée contre l’hôte exact**, pas deux chemins concurrents. Aucune configuration prête à installer dans ce document.

## 11. Moteur indépendant des hooks

Opérations fonctionnelles proposées — **aucune commande actuellement fournie** :

| Opération | Sortie |
|---|---|
| discover / doctor | Racines, version, capacités, couverture, blockers |
| validate | Schémas, IDs, références, autorités, fermeture des ressources |
| reconcile | Diff réel/baseline et transactions interrompues |
| impact | Dépendances touchées, causes, inconnues, revue |
| resume | Contexte utile/prochaine action avec liens d’autorité |
| record-change / review | Proposition/arbitrage explicites, aucun consentement inventé |
| publish-baseline / consume | Snapshot, prérequis et fraîcheur recontrôlés |
| report | Couverture, dette, hypothèses, revues dues, écarts |

Même moteur depuis skill, hook, invocation manuelle et CI : **pas quatre politiques divergentes**. Sorties status/scope/evidence/limitations/nextAction ; profil/schéma/verifier versionnés ; read-only par défaut, écritures/transitions explicitement demandées.

CI contrôle le changement proposé et son impact, sans bloquer tout brouillon ou toute hypothèse ancienne. Les assertions de valeur exigent de vraies preuves. Git hooks et hooks Goose sont distincts ; aucun activé ici.

## 12. Durabilité, sécurité et versionnement

### Ce qui survit à une session ou machine

Versionner vision/specs/décisions/changes/bindings et baselines/preuves **sanitisées choisies**. Ignorer runtime/verrous/traces brutes/cache/reprise dérivée. Images lourdes : Git LFS ou stockage durable choisi explicitement. Registre sans octets accessibles ≠ QA possible ; unavailable/blocked. URL éphémère ≠ preuve durable.

Classification, accès et rétention explicites. Dossier caché ≠ confidentiel. Chemins persistés relatifs à PROJECT_ROOT lorsque possible ; absolus anciens conservés dans l’histoire. Clone/déplacement : rebind explicite, vérification et nouveaux reçus ; aucun identifiant global obligatoire ; un éventuel ID de produit ne prouve ni dépôt ni acteur.

### Transactions et concurrence

Première implémentation : **un écrivain actif par projet** sur autorités/transitions. Delegates sur fichiers disjoints, intégration sérialisée ; verrou local ≠ coordination multi-machine.

Cible : expected baseline/head → verrou borné → validate → staging → archives → décisions/reçus → publication atomique d’un pointeur de transaction complète. Panne = incomplete, jamais nouveau ready. Temporaire + rename, confinement realpath, refus de symlinks/types spéciaux, tailles bornées. Rename d’un fichier ≠ transaction globale : tester protocole multi-fichiers et crash. Aucun verrou neuf déjà intégré à l’adaptateur actuel.

Branches/worktrees : mémoire propre à la branche, IDs stables, contradictions détectées ; aucune fusion automatique de décisions conflictuelles. Métadonnées machine hors Git.

### Historique et suppression

Append-only pour décisions/baselines publiées et tentatives/revues ; diagnostics dédupliqués, bornés, purgeables. Préférer événements durables par fichier/transaction aux JSONL concurrents sans verrou/reprise.

Append-only ne prime pas sur obligation de suppression : purge contrôlée, tombstone non sensible, raison et invalidation des preuves concernées. Ne jamais supprimer pour faire passer un contrôle ; aucune promesse de révocation de copies téléchargées.

## 13. Exemple : maintenance six mois après le prototype

Hypothèse fictive : confirmation fondée sur « brouillon non envoyé ». Nouvelle règle : envoi automatique sous mandat borné.

1. Enregistrer changement et source, sans dépendre de la conversation d’origine.
2. Trouver décision d’autorisation, intention préparer/commander, états brouillon/envoi/résultat inconnu, écrans/reprises/tests concernés.
3. Hook : dirty/needs-review ; **il ne change pas prepare en command et n’accorde pas de mandat**.
4. Responsable : scope/limites/version revue/arrêt/réconciliation.
5. Actualiser contrats, sources et approbations affectées ; conserver les autres écrans et l’ancienne baseline.
6. Implémenter seulement dans la phase autorisée ; envoi réel = demande de production distincte.
7. Vérifier effets, résultats inconnus, non-duplication, révocation et continuité sur nouvelle version.
8. Observer ensuite le gain attendu ; test fonctionnel passé ≠ gain démontré.

La mémoire retrouve pourquoi, quoi revoir, ce qui reste valable et qui décide, sans la session d’origine.

## 14. Migration incrémentale

| Lot | Travail | Acceptation |
|---|---|---|
| 1 — Layout/lecture | Contexte de répertoire, resolver unique, index, autorités, reprise | Sans hooks/app/Beads ; projet inconnu jamais modifié |
| 2 — Relocalisation | Gates/reçus/QA par scope ; PD_ROOT exclu des snapshots code | Garanties préservées ; aucune nouvelle .gates racine en mode cible |
| 3 — Sources/transport | Racines explicites ; annotation migrée coordonnée ou références temporaires | Génération directe, path retour vérifié, guards dev/prod préservés |
| 4 — Maintenance | Changes/bindings/baselines/reconcile/impact/report | Modifications externes, ajouts/suppressions/historique détectés |
| 5 — Observation | Hooks opt-in, aucune autorité métier | Payloads réels, boucles/privacy/limites testés |
| 6 — Contrôle ciblé | PreToolUse sur transitions compatibles | Hors scope non bloqué ; contrôles adapter/CI sans hooks |
| 7 — Durée de vie | Revues dues et résultats autorisés | Étude prévue/réalisée, cible/as-built, valeur supposée/mesurée distinctes |

Réutiliser les skills actuels. Un skill de maintenance dédié pourra être décidé si son rôle est répétitif et isolable ; **aucun nouveau nom livré**. Router chargé au besoin ; research/audit/build/QA restent propriétaires. Contexte utilisateur global non migré dans les produits.

### Compatibilité et historique

- Layout/profil versionné : legacy et cible détectés, jamais deux autorités implicites.
- Inventaire read-only/dry-run et accord avant migration de projet existant.
- Mapping old/new IDs/paths/hashes/raisons ; histoire et rejets conservés.
- Nouveaux reçus après vérification/revue nécessaires : **ancien pass ≠ approbation fraîche**.
- Images historiques gardent leur provenance ; copie documentaire ≠ génération canonique.
- Pas de double écriture permanente ; rollback explicite ; arrêt sur collision/incomplétude. Aucune suppression destructive sans accord.
- Reçus actuels par opération insuffisants pour isoler plusieurs scopes par simple déplacement.

### Synchronisation nécessaire

Resolver/adaptateur, sources, snapshots/exclusions, skills, références canoniques, quatre templates/bootstrap, tests/evals et docs doivent évoluer ensemble. Annotation : quatre ports et guards production si transport changé. Respecter resource closure et packaging runtimes. Ne pas faire de remplacement global des chemins. Compartiments gates/receipts/validation dans PD_ROOT ne suppriment aucune phase.

## 15. Tests de la future implémentation

- Reprise sans conversation : autorités, scope, inconnues et action utiles.
- Syntaxe/version/IDs/liens/doubles autorités/cycles de dérivation invalides rejetés.
- Specs/assets/config/lockfiles/code : modifications/ajouts/suppressions, éditeur externe/shell/wrapper/checkout détectés.
- Impact ciblé ou conservateur correct ; changement cosmétique revu sans refabrication ; effet modifié sans autorisation renouvelée bloque.
- Branches clone/provided/historique/discovery-only, couverture complète, sources corrigées et G4/G5 conservés.
- Scopes multiples sans écrasement de QA/reçus/décisions ; écran partagé impacté.
- Panne par étape, non writable, timeout, événements perdus/dupliqués, verrou abandonné et reprise : jamais nouveau ready incomplet.
- Confinement/symlinks/gros payloads/injection et sentinelles privacy en journaux/captures.
- Hôte exact : events/matchers/noms/protocoles allow-deny/pannes/load/wrappers, limites déclarées ; reconcile compense événement manqué.
- Annotation migrée : soumission dev/fichier/reproduction réelles et endpoint absent/refusé en production, quatre frameworks.
- Layout cible sans nouvelles .gates/QA racine ; mémoire/runtime jamais inclus dans snapshot code ; octets des preuves accessibles.
- Migration/rollback/resource closure ; MD dérivé non autoritatif, YAML sans ambiguïté si supporté.

Puis suite existante et evals comportementales appariées de reprise/changement après build. Fixtures/schémas ne prouvent ni comportement réel du modèle ni UX mesurée. Étude utilisateur, autorité humaine et production restent distinctes.

## 16. Alternatives rejetées et coût assumé

- Gros fichier mémoire : difficile à revoir/charger/invalider ; résumé dérivé seulement.
- Contrat indépendant par rubrique : duplication du blueprint ; compiler unique plus tard seulement si justifié.
- Tout Markdown : références et approbations difficiles à vérifier ; tout JSON : raisonnement et compromis pauvres.
- Hooks écrivant seuls les specs : observation confondue avec décision.
- Graphe/Qdrant obligatoire : index et graphe dérivés sur fichiers suffisent ; recherche avancée facultative, non autoritative.
- Build seul : vision/apprentissages/écarts perdus ; boucle changements/résultats sans backend spéculatif.

Coûts : discipline des liens, responsables, revue, stockage durable, migration et conflits. Présence d’un dossier ≠ qualité. Mieux vaut maintenance proportionnée et contrôles explicites qu’une documentation exhaustive jamais relue.

## 17. Vérification effectuée / Verification Completed

Dépôt : `plugin.json`, références liées, `scripts/check-workflow-evidence.mjs`, `scripts/source-artifacts.mjs` et instructions. `npm test` a passé avant et après rédaction le 2026-10-19 ; il vérifie **l’existant, pas l’implémentation proposée**. Les liens locaux du document et son format Markdown ont été contrôlés ; `git diff --check` ne signale aucune erreur.

Documentation Goose consultée via carte officielle le 2026-10-19 :

- [Hooks](https://goose-docs.ai/docs/guides/context-engineering/hooks) : scripts/events/matchers/payloads/noms, blocage PreToolUse/Stop, refus, on_failure/chargement, PreToolUseResult non durable et layout documenté.
- [Agent Skills](https://goose-docs.ai/docs/guides/context-engineering/using-skills) : instructions/ressources chargées en session ; reprise proposée par workflow, pas persistance automatique.
- [Plugins](https://goose-docs.ai/docs/guides/context-engineering/plugins) : conteneur skills/hooks et configuration distincte des données produit.

Snapshot creator et docs actuelles divergent sur noms/capacités/layout ; vérification de l’hôte installé encore nécessaire. Aucun hook créé/testé live/installé/activé ; aucun skill, contrat, template ou runtime modifié par cette proposition.

**Prochaine étape : valider l’autorité et le layout, puis implémenter resolver et reprise sans hooks avant relocalisation des preuves et automatisation événementielle.**
