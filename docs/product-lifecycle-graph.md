# Cycle de vie produit — Skills, fonctions et exploration de graphe

Statut : **cartographie actuelle, méthode et readers implémentés en source**, 2026-10-19. Complément opérationnel à la [proposition minimale](product-memory-read-write-review.md), pas nouvelle autorité produit ni registre de tâches. Les fonctions livrées sont nommées depuis le code et intégrées aux skills via [le contrat lifecycle](../references/product-lifecycle-reasoning.md). Les hooks restent proposés ; aucun hook, tracker ou plugin installé n’est activé par cette révision.



## Sommaire

- [Capacités et boucle implémentée](#0-capacités-et-boucle-de-raisonnement-implémentée)
- [Trois graphes](#1-trois-graphes-pas-un-pipeline-magique)
- [Appels réels par phase](#2-appels-réels-par-phase)
- Sections suivantes : transitions exécutables, prompt/Skills/hooks, graphes de connaissance, outils et readers, méthode, expériences et limites.

## 0. Capacités et boucle de raisonnement implémentée

~~~mermaid
flowchart TD
  PROMPT[Demande humaine sur un produit explicite] --> ROUTE[index et skill focalisé]
  ROUTE --> TOOLS[checkProductTooling et inspectProductCapabilities]
  TOOLS --> NEED{Capacité nécessaire disponible ?}
  NEED -->|outil facultatif absent| OFFER[Offre une fois - setup après consentement]
  OFFER --> RET[Retrieve - specs ou tâche exacte]
  NEED -->|preuve obligatoire absente| BLOCK[Blocage précis - conserver le travail]
  NEED -->|oui| RET
  RET --> TEXT[readProductInformation - navigation puis section cible]
  TEXT -->|suite sous même SHA| TEXT
  TEXT --> TRAV[Traverse - readProductSlice borné]
  TRAV --> EXP[Explore - incertitude qui change la décision]
  EXP --> VER[Verify - contenu, identité, fraîcheur et critères]
  VER -->|manquant ou stale| RET
  VER -->|accord applicable| ACT[Action scoped - publish puis consume frais]
  ACT --> IMAGE[prepareSourceAttempt puis outil et inspection]
  ACT --> CODE[Frontend approuvé ou correction scoped]
  ACT --> ANN[Inspecteur annotation puis capture, edit et recapture]
  IMAGE --> EVID[Ledger et preuves existantes]
  CODE --> QA[design-qa et review-handoff]
  ANN --> QA
  EVID --> VER
  QA -->|défaut| RET
  QA -->|pass et consume| REVIEW[Revue / partage demandé]
  RET -.-> BD[Beads : travail natif et tâches fermées]
  RET -.-> ENT[Git et Entire : provenance autorisée]
~~~

checkPhaseCapabilities vérifie l’affordance disponible, pas connectivité, workspace, pixels ou URL. Le graphe est dérivé ; pas nouveau registre. planToolSetup propose les commandes consenties, l’agent exécute après recheck, jamais un hook auto-init. Le support externe Goose est reconnu sans reconfigurer le dépôt de développement.

La lecture de texte suit [progressive disclosure](../references/product-information-disclosure.md) : navigation dérivée, section sémantique/entité ciblée puis détail nécessaire. readProductInformation retourne des pages bornées avec source SHA et continuation ; le graphe ne précharge plus les racines JSON complètes. Complétude du texte et borne de parcours sont distinctes. Un hash actuel ne retrouve pas une ancienne justification perdue.

## 1. Trois graphes, pas un pipeline magique

- **Workflow** : quelle phase peut suivre quelle décision, avec conditions et branches.
- **Connaissance** : quelle raison/input justifie une décision, quelles tâches et quels états la concernent.
- **Preuve** : quels bytes, sources, états et implémentation ont été réellement revus/vérifiés.

Une flèche workflow n’est pas une preuve causale ; une relation Beads blocks n’est pas une autorisation de build. Mermaid est une vue lisible de ces relations, pas leur stockage canonique ni un moteur d’inférence. Les relations sont extraites des autorités ; ne pas maintenir un fichier graph/relations auteur parallèle.

### Cycle complet, avec frontière de production

~~~mermaid
flowchart TD
  U[Prompt humain] --> R[product-design:index]
  R --> C[product-design:get-context]
  R --> A[product-design:audit]
  R --> M[product-design:annotate]
  R --> UC[product-design:user-context si demandé]
  C --> E[product-design:research si nécessaire]
  E --> C
  C --> STOP[Découverte ou décision de ne pas construire]
  C --> G1[G1 applicable et brief-to-ideation]
  G1 --> I[product-design:ideate - trois parcours complets]
  I --> G2[G2 - choix humain du parcours]
  G2 --> FIX[Compléter ou corriger seulement les sources choisies]
  FIX --> G3[G3 - accord sur le set complet corrigé]
  C --> PROVIDED[Cible fournie - capture et revue du périmètre]
  PROVIDED --> G3
  G3 --> G4[G4 - autorisation explicite frontend et états de test]
  G4 --> B[image-to-code ou url-to-code selon branche]
  B --> Q[product-design:design-qa]
  Q -->|défaut de code| B
  Q -->|défaut de source| FIX
  Q -->|preuve passée et consume frais| H[G5 - handoff reviewable]
  H --> S[product-design:share seulement sur demande et cible choisie]
  H -.-> P[Production explicitement demandée - ingénierie du produit]
  P -.-> O[Release et exploitation - CI et contrôles production]
  O -.-> F[Observations autorisées et incidents]
  F -.-> R
  H --> F
  A -->|redesign demandé après audit| C
  M -->|changement scoped vérifié| Q
~~~

Les arêtes pointillées de production/exploitation sont **hors adaptateur actuel**, pas G6/G7 implémentés. La branche source fournie inclut exact-clone/provided-target ; historical-selection conserve son choix, complète/corrige le set et rejoint G3 sans nouveau G2 fictif. Single-screen réellement isolé : trois directions du même écran, pas trois parcours. Audit critique l’expérience existante ; design-qa compare une implémentation à sa source.

Les compétences/tools browser/image/hosting sont externes au plugin. Un graphe correctement relié ne remplace ni capture ni inspection. Une annotation impliquant une nouvelle intention ou un périmètre matériel retourne à l’arbitrage/sources/approbations applicables, pas automatiquement au code.

## 2. Appels réels par phase

Préfixe chargé : product-design:. Charger chaque peer via Skills.loadSkill({name: 'product-design:...'}), pas lire son SKILL.md pour remplacer l’invocation. Le préfixe API Skills est celui exposé dans cette session ; un autre hôte peut présenter autrement le même chargement.

Les scripts ESM s’exécutent dans un processus Node avec accès filesystem. Les outils de cette session sont appelés via Developer.shell/write/edit/readImage et Imagemcp.imageGenerate/imageEdit ; les fonctions de scripts ci-dessous **ne sont pas des outils MCP**. Les wrappers generate/inspect/persist nécessitent de vrais callbacks d’intégration ; un CLI de validation ne fait pas ces actions à leur place.

| Étape | Skill propriétaire | Fonctions / CLI existants | Sortie et limite |
|---|---|---|---|
| Router | index | Skills.loadSkill | Charge le bon contrat, pas toute la mémoire |
| Capacités | index/focalisé | checkProductTooling ; inspectProductCapabilities ; checkPhaseCapabilities ; planToolSetup | Disponibilité/association et plan consenti, pas exécution |
| Rationale / impact | focalisé | readProductSlice ; validateProductReferences ; renderProductGraph ; readBeadsIssues | Graphe borné et diagnostics, aucun accord renouvelé |
| Inbox annotation | annotate | checkAnnotationQueue ; validateAnnotationRecord | Ordre et risques de replay, pas capture/edit/move |
| Préférences facultatives | user-context | dist/user_context_preflight.js ; dist/init_user_context.js du skill pour initialisation autorisée | État local utilisateur hors repo, pas spec actuelle du produit |
| Brief / intention / scénarios | get-context | validateG1(record, targetPhase), validateDesignContract(contract), validateExperienceBlueprint(blueprint, designContract) | Déclarations structurées ; pas étude utilisateur ni identité d’approbateur |
| Recherche | research | Outils de sources/recherche disponibles ; pas API de recherche autonome livrée par le plugin | Sources/contre-évidence/hypothèses ; peut arrêter sans build |
| Audit | audit | Browser/capture disponible, inspection de l’expérience | Findings ; pas checkTransition obligatoire pour audit-only |
| G1 → exploration | get-context → ideate | checkTransition({project, requestPath}); puis même appel consume:true, operation brief-to-ideation | Reçu scoped ideation ; aucune permission de scaffold |
| Manifest / génération | ideate | validateIdeationManifest, selectIdeationMode ; source-plan APIs détaillées ci-dessous | Trois inventaires complets comparables ; sources séparées |
| Présentation comparative | ideate | build-journey-board.mjs --input --output ; serve-journey-board.mjs --root | Trois pages dérivées ; ni écrans sources ni app produit |
| Choix G2 | ideate | validateDirectionSelection ; checkTransition operation source-selection puis consume | selected-screen-production seulement |
| Accord G3 | ideate, ou branche cible capturée | validateScreenSetEvidence ou validateTargetSet(set, workflow) ; checkTransition operation source-set-approval puis consume | build-handoff seulement, pas build |
| Build G4 | image-to-code / url-to-code | checkTransition operation prototype-build puis consume ; bootstrap-prototype.mjs pour nouveau projet autorisé | Frontend mock-data, sources/états/roots explicites ; réutiliser app existante |
| QA G5 | design-qa | snapshotImplementation(project, paths), checkTransition operation review-handoff ; renderQa(report) dans l’adaptateur ; consume après pass | JSON canonique, MD dérivé, archives de tentatives ; captures/interactions réelles indispensables |
| Annotation installée | annotate | validateAnnotationReceipt ; outils capture/edit ; déplacement inbox → processed | Reproduire route/viewport/bbox ; QA applicable après cycle |
| Injection consentie | annotate-inject | Ports assets/annotate + validateAnnotationReceipt | Vérifier overlay/POST/fichier et prod absent/refusé ; ne pas réinjecter starter |
| Travail suivi | project-status | CLI bd ; assertBeadsClosure({gate,bead}) pour miroir de phase | Beads possède tâches/relations ; statut ne décide pas G4/G5 |
| Share demandé | share | Outil hosting choisi et vérification de son URL | Déploiement reviewable ; pas preuve production-ready |
| Production / release | Aucun skill product-design propriétaire universel | Tests, CI, sécurité, migrations et déploiement de l’application | Phase explicitement autorisée ; pas un checkTransition G6/G7 inventé |

Modules exacts : validate* et assertBeadsClosure dans scripts/workflow-evidence-contract.mjs ; validateIdeationManifest/executeThreeLanes dans scripts/ideation-contract.mjs ; checkTransition/snapshotImplementation/renderQa/validateTargetSet dans scripts/check-workflow-evidence.mjs. validateBuildHandoff legacy n’est pas le point d’entrée moderne multi-branches ; utiliser l’adaptateur actuel.

### Une génération de source, appel par appel

~~~text
ideate
  → checkSources(values) via scripts/check-source-artifacts.mjs
    → verifySourcePlanFiles(plan, {project})
      → validateSourcePlan(plan)
      → validateExperienceBlueprint(blueprint, designContract) si involved
    → prepareSourceAttempt({project, plan, screenId, attempt,
                            toolSchema, toolName, ledger})
      → verifySourceLedger(plan, ledger, {project})
      → sourceDestination(plan, screenId, attempt, {project})
  → Imagemcp.imageGenerate / imageEdit avec destination préparée exacte
  → inspection visuelle des bytes réellement retournés
  → verifySourceRecord(plan, record, {project}) puis append/persist ledger
~~~

L’alternative d’intégration executeSourceAttempt({project,plan,screenId,attempt,toolSchema,toolName,ledger,generate,inspect,persist}) enveloppe preflight → generate → inspection → vérification → persistance. executeThreeLanes dans l’autre module orchestre des lanes via callbacks ; ne pas prétendre que ce scheduler implémente automatiquement tout le nouveau source-plan preflight.

prepareSourceAttempt renvoie workspace_output_path, save_to_workspace:true, n:1, expectedPath. L’outil image doit effectivement exposer ces arguments. Destination actuelle : generated/product-design/<journey>/<session>/<variant>/<screen>-attempt-<N>.png ; workspace_output_path omet generated/. Aucun generate-random-then-copy. Source acceptance n’est ni userApproved ni runtimeVerified. Conserver rejets ; pas nouvel attempt après accepted dans le même plan figé.

### Une transition, appel par appel

~~~text
Skill → Developer.shell
  → node PLUGIN_ROOT/scripts/check-workflow-evidence.mjs
       --project PROJECT_ROOT --request REQUEST
  → checkTransition({project, requestPath})
    → validateurs applicables + fichiers/identités + source ledger si lié
    → archives exactes des entrées/preuves
    → archive du gate
    → mirrorBeads callback seulement si explicitement intégré
    → publication du reçu scoped
Skill, immédiatement avant l’action → même CLI avec --consume
  → checkTransition({project, requestPath, consume:true})
    → relecture et comparaison des dépendances/reçu/vérificateur
  → action seulement si résultat passed, bonne portée et readyFor attendu
~~~

Le CLI actuel n’installe pas de hooks, n’appelle pas bd ni Image MCP, et n’authentifie pas un accord humain. Un callback miroir configuré qui échoue bloque la publication ; Beads absent n’est pas une dépendance. consume n’est pas single-use/sandbox ; il ne publie pas de nouvelle readiness passée et peut enregistrer un échec/invalidité sur sa branche d’erreur. Un direct appel JS doit examiner result.status, pas seulement l’absence d’exception. Écriture interrompue ou concurrence après consume reste une limite ; un writer d’intégration/transition au départ.

Chemins actuels .gates/ et design-qa.json/design-qa.md racine restent ceux de l’exécution. Leur relocalisation sous .product-design est une migration séparée, pas obtenue par ce diagramme.

## 3. Prompt, outils et hooks : qui appelle quoi ?

La séquence suivante est logique/simplifiée ; elle ne prétend pas fixer l’ordre interne de tous les événements spécialisés/wrappers. Les hooks sont des commandes locales chargées par l’hôte, pas des appels LLM ou Skills.loadSkill.

~~~mermaid
sequenceDiagram
  actor Human
  participant Host as Goose
  participant Agent
  participant Skill as Skills tool
  participant Tool as Tool or Developer.shell
  participant Engine as Node script
  participant Hook as Optional hook command
  Human->>Host: Prompt
  opt UserPromptSubmit hook configured
    Host->>Hook: JSON stdin - observation only
    Hook-->>Host: Diagnostic, not product approval
  end
  Host->>Agent: Request and discovered skill descriptions
  Agent->>Skill: loadSkill product-design:index then focused skill
  Skill-->>Agent: Full instructions and resource paths
  Agent->>Tool: Read selected authorities or invoke script
  opt PreToolUse hook configured
    Host->>Hook: Tool payload, exact host tool name
    Hook-->>Host: Allow or documented block decision
  end
  alt Tool allowed
    Tool->>Engine: Explicit project and arguments when script needed
    Engine-->>Tool: Structured result
    Tool-->>Agent: Tool result to consume
    opt PostToolUse or PostToolUseFailure configured
      Host->>Hook: Outcome event
      Hook-->>Host: Bounded diagnostic
    end
  else Tool denied
    Host-->>Agent: Policy denial - no tool execution
  end
  Agent-->>Human: Decision, provenance, limitations and next action
~~~

SessionStart n’implique pas lecture de la mémoire produit. Le rapport d’un hook n’est pas automatiquement injecté dans le contexte modèle ; le skill doit lire le résultat/rapport par un outil. Un hook ne charge pas de skill pour lancer génération, QA ou build.

### Contrat des appels hooks proposés — rien de livré/activé

Un seul adapter envisagé handleProductEvent({payload, projectAssociation}) serait invoqué par une commande locale plugin-relative. projectAssociation vient d’un adapter hôte explicitement activé et vérifié ; travailler depuis PLUGIN_ROOT ou le cwd du handler ne résout pas le produit. Les champs payload sont facultatifs selon événement ; working_dir documenté sur événements outils n’est pas garanti sur SessionStart/UserPromptSubmit/Stop.

| Événement Goose | Fonction appelée dans l’adapter proposé | Effet autorisé |
|---|---|---|
| SessionStart / UserPromptSubmit | handleProductEvent : aucun effet sans association produit ; au plus lecture d’un diagnostic dirty déjà local | Pas scan réseau/DB, création de tâche ni stockage du prompt |
| AfterFileEdit | handleProductEvent → validation locale bornée des références touchées ou diagnostic dirty | Aucun rewrite de rationale/JSON ; vérifier path réellement confiné |
| PostToolUseFailure | handleProductEvent → diagnostic d’opération potentiellement interrompue | Ne pas supposer absence de mutation partielle |
| PreToolUse pour invocation de transition reconnue | handleProductEvent → checkTransition({project,requestPath,consume:true}) | Contrôle frais, puis traduire result.status en protocole hook ; jamais publication d’accord |
| Stop | Par défaut aucun blocage ; diagnostic local si utile | Ne pas prolonger le tour pour réparer arbitrairement la mémoire |

Le reader complet/Beads/Entire et la génération Mermaid sont **explicites, hors hook**. Aucun appel bd close/comment, Entire enable/checkpoint --generate, Image MCP ou test-suite dans ces hooks. Après un edit externe ou un shell mutation non reconnu, le prochain read/transition recalcule : les hooks ne sont pas des watchers.

Le matcher PreToolUse vise un nom d’outil, pas une opération JS : ^shell$ dans les docs Goose actuelles, mais vérifier le nom réellement émis sur l’hôte choisi. L’adapter inspecte ensuite une invocation précise approuvée ; ne pas parser tout Bash ni promettre interception universelle de SDK/code-mode/wrappers. Appels non reconnus hors population gardée ne deviennent pas refus globaux ; une voie structurée de transition serait un adapter futur, pas un tool déjà livré.

Traduction de blocage : exit 2 avec raison stderr ou stdout JSON decision:block/reason. result.status blocked ou exit CLI 1 ne bloquent pas eux-mêmes Goose. Les diagnostics ordinaires vont sur stderr ; stdout réservé à la décision. on_failure:block est documenté pour certaines actions PreToolUse sélectionnées, pas erreurs matcher/configuration ; Stop reste fail-open. Les autres événements ne bloquent pas.

Avant activation : résoudre divergence hooks/hooks.json upstream versus extension Goose namespacée du tooling Agent Plugins local ; vérifier version, payloads, matchers, executable, permissions, allow/deny/failure/recovery et effets wrappers. Aucun test live de ces hooks n’a été effectué ici.

## 4. Graphe de connaissance dérivé, pas nouvelle base

~~~mermaid
flowchart LR
  W[Tâche Beads] -.->|explained-by metadata facultatif| R[Raison MD]
  W -.->|affects metadata facultatif| D[Décision produit]
  F[Input et niveau de preuve] -->|inputIds| Q[Question et réponse]
  Q -->|decisionIds| D
  D -->|decisionIds inverse dérivé| SS[État écran]
  SC[Scénario] -->|scenarioId| SS
  SS -->|screenStateIds inverse dérivé| T[Critère de vérification]
  SS -->|screenStateIds inverse du plan| SP[Source plan et source exacte]
  SP -->|approved set| G[Accord et reçu scoped]
  G -->|executionContract| C[Implémentation réelle]
  C -->|snapshot bytes| V[Résultat QA et captures]
  T -.->|association au résultat à vérifier| V
  W -.->|résolution et commit déclarés| COM[Commit Git]
  COM -.->|association Entire native si présent| ENT[Checkpoint Entire]
  W -.->|verified-by résultat lié| V
~~~

Pointillés : liens conditionnels ou convention manquante, pas relations déduites comme faits. Arêtes pleines : relations représentables dans les contrats existants ; elles ont encore besoin de données réelles et de contrôles. La flèche critère → QA n’est pas un binding natif universel déjà garanti. Une sélection de roots de code ou fichiers touchés n’est pas un mapping précis fonction → état.

Le graphe dérivé distingue pour chaque nœud/edge : identité qualifiée (produit + document/collection/id, tracker vérifié + issue, repo + commit), origine (path/champ ou réponse CLI), révision/hash réellement observé, statut pertinent et limite de couverture. Ce sont metadata de lecture, pas nouveaux champs auteur imposés aux v1.

Une arête peut être déclarée, inversée/calculée depuis une déclaration, ou inférée par l’agent. Les inférences restent hypothèses et sont séparées des relations validées ; jamais persistance comme lien accepté sans revue. L’état current/historical/unavailable/stale d’une preuve ne se confond pas avec closed/open d’une tâche ni assumed/answered d’une question.

## 5. Outils réellement nécessaires pour raisonner

| Besoin | Minimum | Facultatif / limite |
|---|---|---|
| Lire specs et extraire relations natives | Shell/files + Node.js 22+ + contrats existants | Petit Map/Set en mémoire suffit ; pas DB de graphe |
| Retrouver travail et dépendances | bd CLI si tracker actif ; contexte vérifié, sorties JSON et traversée native | Pas parser de Dolt/JSONL ni installation imposée |
| Retrouver la fabrication | Git ; Entire CLI si provenance existante/accessible | Goose externe confirmé par l’utilisateur ; développement désormais enabled, sans checkpoint capturé vérifié par ce travail |
| Lire raison MD liée à une entité | Parser convention fine à implémenter seulement quand utilisée | Hyperlien document/anchor suffit au début ; pas extraction LLM de prose considérée compilation |
| Voir le graphe | Bloc Mermaid Markdown ou export natif bd | Renderer Mermaid seulement pour visualisation ; mmdc non présent ici, aucun rendu revendiqué |
| Comprendre implementation | Lecture code, recherche, Analyze.analyze quand pertinent | Call graph de code ≠ graphe des intentions produit |
| Confirmer les états/résultats | Browser autorisé, serveur et captures ; image tooling pour sources | Pas remplaçables par Mermaid, hashes ou tests structurels |

Beads installé fournit déjà bd dep tree avec --direction down/up/both, --max-depth et --format mermaid. Réutiliser cet export pour son sous-graphe tâches ; aucune raison d’écrire un renderer Beads. Pour le graphe produit croisé, la projection Mermaid peut être générée à partir de l’extraction native et des références manquantes, sans sauvegarde authored.

Appels lecture vérifiés sur bd 1.1.2 (illustrations avec ISSUE réellement choisi, pas tâches créées ici) :

~~~bash
bd --readonly context --json
bd --readonly show ISSUE --json --include-comments
bd --readonly dep tree ISSUE --direction both --max-depth 3 --format mermaid
# Recherche historique : inclure closed ; description via filtre dédié.
bd --readonly search "draft" --status all --json
~~~

La complétude et l’ordre des résultats restent à vérifier contre la version/backend ; un max-depth est une limite affichée, pas couverture globale. Git/Entire distants ne sont pas fetchés implicitement. Résumés générés et transcripts sont soumis à consentement/privacy. Pour un petit produit, ni Neo4j, Qdrant, vector search, custom graph agent ni MCP supplémentaire ne sont requis. Une recherche vectorielle pourra proposer des seeds à grande échelle, mais ne fournit pas les relations ni la fraîcheur.

### API read-only livrée et hook proposé

- readProductSlice({project,documents,seeds,direction,limits,tasks,env}) : assemble autorités locales + réponses CLI autorisées, extrait relations typées et retourne une tranche avec provenance/truncation/unknowns.
- validateProductReferences({project,references}) : résout uniquement liens MD/metadata Beads manquants, sans refaire les validateurs/graphes existants ; validation draft distincte de readiness.
- renderProductGraph(slice) : vue Mermaid échappée, déterministe ; ne recompile pas du Mermaid édité vers des contrats.
- handleProductEvent({payload,projectAssociation}) : adapter hooks borné ci-dessus ; hors première implémentation.

readProductSlice, validateProductReferences et renderProductGraph sont désormais exports de scripts/read-product-slice.mjs ; handleProductEvent reste proposé, non implémenté. Voir les signatures réelles et limites dans [le contrat canonique](../references/product-lifecycle-reasoning.md). Ne pas ajouter de moteur de tâches, ingestion de transcript ou journal d’événements. Le reader appelle sourceImpact pour impact/fraîcheur et renvoie à checkTransition pour readiness, sans l’exécuter lui-même ; ne pas reconstruire leurs garanties dans une recherche de graphe.

## 6. Méthode d’exploration à intégrer à ma façon de travailler

Oui : pour une question produit impliquant plusieurs décisions, je peux raisonner sur un sous-graphe explicite plutôt que relire au hasard. Ce n’est ni infaillible ni obligatoirement plus simple à grande échelle. Utiliser le graphe pour choisir les prochaines lectures, puis vérifier dans les autorités ; il ne remplace pas leur contenu.

1. **Retrieve** : partir d’une demande, d’une tâche, d’un état ou d’une décision avec identité précise.
2. **Traverse en amont** : retrouver input/question/raison/invariant ; préciser hypothèse, décision et preuve.
3. **Traverse en aval** : états/scénarios/critères/sources et résultats dépendants ; conserver types/directions.
4. **Explore** : choisir le prochain nœud qui réduit une incertitude matérielle, pas charger tout le graphe. Si limite atteinte ou liens manquants, demander/chercher l’information plutôt que déclarer no-impact.
5. **Verify** : ouvrir le contenu/revision réel, appeler le contrôle adapté, comparer portée et fraîcheur. Chaque conclusion explique son chemin et ses limites.
6. **Act / publish** : modifier le bon propriétaire seulement, sous autorisation ; reprendre la transition applicable. Mermaid est facultatif si un petit tableau de chemins suffit.

Séparer les traversées : expliquabilité, impact candidat, tâche prête et preuve applicable n’ont pas les mêmes filtres d’arêtes. Ne pas propager une réouverture/commande sur tous les liens related/explained-by. Cycles de navigation de parcours peuvent être normaux ; visited set évite boucle de recherche, et les contraintes Beads de scheduling ne s’imposent pas à tout le graphe de connaissance.

Une recherche d’impact fine peut proposer SS2/T2, mais **ne diminue pas la dépendance hash actuelle d’un fichier blueprint entier**. sourceImpact signale tous les écrans pour changement du context ; renouveler les revues appropriées. Toute optimisation en dépendances d’entités exige autre contrat/validation, pas se fier au diagramme.

Cette méthode est désormais intégrée aux skills focalisés via le contrat canonique product-lifecycle-reasoning, avec scénarios de régression et readers read-only. Les expériences ci-dessous restent historiques et limitées ; aucun hook ni mémoire utilisateur n’est activé.

## 7. Démonstration réellement exécutée sur la fixture existante

Source : tests/fixtures/experience-blueprint.mjs, fichier fictif, SHA-256 9446c65ac093eea8a659d9e27400429bff00ebab3bcedbeaf634855f596fde4a au moment du test. Script Node ponctuel, rapport local temporaire hors repo ; pas nouveau module runtime livré.

Assertions exécutées : validateExperienceBlueprint passe ; traversal amont de D2 donne exactement F2/Q2/D2 ; aval donne exactement D2/SS2/T2 ; decisionIds pointant vers une décision absente est rejeté. SC2 retrouvé depuis l’état.

~~~mermaid
flowchart LR
  F2[F2 - assumption] -->|informs| Q2[Q2 - assumed]
  Q2 -->|justifies déclaré| D2[D2 - préparer le travail futur]
  D2 -->|réalisé par déclaration| SS2[SS2 - préparé sans envoi externe]
  SC2[SC2 - scénario opérateur] -->|contient| SS2
  SS2 -->|critère applicable| T2[T2 - proposed, pas exécuté]
~~~

Conclusion justifiée : D2 porte une hypothèse de préparation anticipée ; SS2 doit distinguer préparation et envoi, et T2 propose de vérifier absence d’envoi externe et dates inconnues visibles. L’input F2 est assumption, Q2 assumed, T2 proposed : **aucune valeur utilisateur ni test passé n’est démontré**.

Non exécuté : jointure avec Beads réel/MD rationale/source plan/code/QA, nouveau reader, hook live ou visualisation Mermaid rendue. Le script ne teste pas toutes les références ni tous les scénarios. Il démontre que le petit sous-graphe déjà structuré est exploitable et expose correctement une limite, pas que la future architecture est validée.

## 8. Spike croisé specs → tâche Beads → résultat structurel

Exécuté le 2026-10-19 dans un nouveau sandbox /tmp/pd-cross-tool-j9hjsz9u : Beads 1.1.2 embedded, tâche synthétique pdx-874 fermée. HOME/config et variables de routage Beads/Git isolés ; init --skip-hooks --skip-agents, aucun commit ni modification du tracker projet. Harness/trace/rapport conservés uniquement sous evaluations/product-memory-cross-tool/ ignoré. Le spike n’est pas un reader livré ; ses assertions ont été fixées avant exécution.

**Résultats :** roundtrip réel du namespace metadata proposé ; lien MD/ancre et entités D2/SS2 résolus ; validateExperienceBlueprint réel passé ; traversal D2 → SS2 → T2 exact ; résultat JSON écrit après exécution des assertions structurelles ; lien verified-by enregistré via CLI Beads ; tâche retrouvée après clôture avec recherche incluant closed, absente de la recherche par défaut ; relecture par nouveaux processus CLI sans cache du lecteur.

**Négatifs :** ancre inexistante, entité absente et path traversant refusés ; modification de la raison rend le résultat stale sans invalider l’histoire de tâche terminée ; restauration des bytes rétablit l’identité de la preuve initiale, pas un nouvel accord. Mauvaise association tracker et absence d’outils optionnels sont des injections simulées, pas tests live sur un second tracker ou désinstallation. Sans CLI optionnel, les specs restent lisibles et l’historique est signalé unavailable.

Le résultat vérifie des **liens structurels** et la fraîcheur des dépendances du spike, pas le comportement applicatif prévu par T2. T2 reste proposed ; aucun navigateur, code produit, source visuelle, QA G5, étude utilisateur ou accord humain testé. Entire était volontairement non activé dans le sandbox de cette expérience ; pas de jointure checkpoint. Ce constat ne décrit pas la configuration Entire activée ensuite par l’utilisateur dans le dépôt de développement. Cette expérience soutient l’utilité d’un petit reader de références ; elle ne valide pas encore le schéma général, un adapter/hook, les conflits concurrents ou toute la maintenance.

## Vérification effectuée / Verification Completed

Contrats et fonctions relus dans [transitions](../references/executable-transitions.md), [source artifacts](../references/source-artifacts.md), scripts/workflow-evidence-contract.mjs, scripts/source-artifacts.mjs, scripts/check-workflow-evidence.mjs et scripts/check-source-artifacts.mjs. Peers chargés via l’outil Skills ; les SKILL.md sources du checkout ont des bytes différents des fichiers installés et ont été relus pour les frontières après chargement. Aucune synchronisation/install update effectuée : cette cartographie décrit le **checkout**, pas la garantie d’exécution d’un ancien bundle installé.

Goose : [Skills](https://goose-docs.ai/docs/guides/context-engineering/using-skills) pour découverte/chargement ; [Plugins](https://goose-docs.ai/docs/guides/context-engineering/plugins) pour container/composants ; [Hooks](https://goose-docs.ai/docs/guides/context-engineering/hooks) pour événements, noms/outils, payloads, protocoles et limites. CLI Beads inspecté pour contexte/traversée/export ; [Beads](https://github.com/steveyegge/beads) et [Entire](https://github.com/entireio/cli) pour leurs rôles déjà vérifiés. Aucun hook mémoire produit vérifié live, renderer installé, checkpoint Entire/Goose capturé vérifié ou étude utilisateur conduite. L’utilisateur a depuis activé Entire/Goose pour le dépôt de développement ; l’onboarding facultatif est décrit dans [le contrat canonique](../references/tooling-onboarding.md).

**Livraison suivante effectuée :** reader explicite read-only, capacités par phase et inspecteur de queue annotations, tests reproductibles et skills synchronisés. Aucun hook ni écriture automatique du tracker. Voir [le plan et les limites](capability-lifecycle-implementation.md).
