# Proposition — Schémas de mémoire produit et exécution des contrôles

Statut : **proposition de schémas, non implémentée**. Date : 2026-10-19. Complément à [la mémoire produit](product-memory-proposal.md). Aucun nouveau JSON Schema, moteur de maintenance ou hook n’est livré. Exemples fictifs, pas preuves ou approbations opérationnelles.

## Révision par soustraction — statut des options

[Proposition minimale — spécifications produit, mémoire de travail Beads et provenance Entire facultative](product-memory-read-write-review.md) est désormais la référence. Elle retire du socle tout registre de tâches, journal de changements ou graphe déjà fourni par ces outils ; seules les références entre autorités et leurs contrôles manquants sont proposées. Pas de catalogue auteur, requirements, relations, scope ou baseline obligatoire sans consommateur concret. Les listes ci-dessous sont un inventaire historique d’options, pas un socle à implémenter. Les contrats existants restent pour compatibilité, sans considérer leurs chevauchements comme résolus. Aucun parser, tracker, adapter Entire/Goose, hook ou migration n’est activé.

## 1. Corrections et modèle commun

- **Index = catalogue d’autorités**, pas copie des contenus, hashes ou statuts de fraîcheur. Ces derniers sont calculés et cachés séparément.
- **Liens natifs conservés** dans leurs contrats ; `relations.json` optionnel pour les liens supplémentaires seulement. Graphe complet dérivé, pas édité deux fois.
- **Brouillon ≠ contrat prêt à une transition.** Une question ouverte doit pouvoir être conservée sans fabriquer readiness.
- **Événement ≠ dépendance ≠ causalité démontrée.** Le hook signale ; reconcile vérifie ; impact propose des revues ; personnes/skills qualifient le sens.
- **Impact ≠ build automatique.** Ne pas réécrire les décisions acceptées ni effacer les résultats antérieurs.
- **Mémoire produit ≠ configuration de l’agent.** Racine reçue à l’exécution ; activation des hooks dans l’hôte. Aucun script arbitraire ni choix de modèles dans les données métier.

### Conventions proposées pour les nouveaux schémas

JSON Schema versionné dans le plugin : schemaVersion entier par format et kind discriminant ; objet fermé, champs inconnus/clefs dupliquées refusés, types/enums/tailles bornés. Pas d’URL $schema publiée inventée : son emplacement versionné sera défini à l’implémentation.

ID stable par document natif ; artifactId unique au projet. Référence `{artifactId, entityId}` pour éviter collision d’IDs sans modifier l’histoire des v1. Null seulement si autorisé, inconnues explicites.

**Chemins nouveaux relatifs à PROJECT_ROOT**, y compris .product-design/, normalisés/confinés sans .. ou symlink. Racine réelle résolue à l’exécution. Anciens contrats absolus conservés avant migration.

Révision d’auteur ≠ hash ≠ version de schéma ≠ version plugin. Distinguer hash d’octets, hash de JSON canonique et hash de projection ; respecter les types de hashes des contrats actuels. Métadonnées nouvelles via sidecars/enveloppes versionnées, pas champs ajoutés silencieusement aux v1.

Contrôles : syntaxe/schema → références/cohérence déclarée → prérequis de la transition. Aucun ne démontre seul valeur, pixels ou autorité humaine.

## 2. Correction : pas de project.json dans le socle

**Le répertoire de travail établi pour la tâche définit le contexte du projet.** Le dossier `.product-design/` et son `index.json` ont un emplacement conventionnel ; aucun fichier supplémentaire ne doit redéclarer la localisation de la racine.

Retirer du socle proposé `project.json`, `paths.index`, `layoutVersion` séparé, `defaultScopeId`, `automation.mode`, `automation.guardOperations` et la déclaration globale `implementationRoots`. Pas de nouvelle configuration de Goose, Claude, Codex ou de fournisseurs/modèles ; aucun modèle ou outil à choisir ou à déclarer dans la mémoire produit. Le travail multi-modèle reste indépendant des contrats métier.

La version de format appartient aux documents (`schemaVersion`), pas à la configuration de l’agent. Nom et vision du produit restent dans le cadre Markdown. Pas de `projectId` redondant requis dans chaque fichier local ; un ID de produit serait une extension optionnelle à justifier pour des références inter-projets, pas nécessaire localement.

### Résolution à l’exécution, sans emplacement enregistré

Le moteur reçoit le contexte de répertoire de l’appelant ou une racine explicitement passée pour cette invocation, vérifie le dossier conventionnel et le confinement. Argument d’exécution, pas champ persistant. Le cwd d’un handler peut différer du contexte de tâche : utiliser le contexte réel disponible, jamais supposer que le plugin est le produit.

Depuis un sous-dossier, utiliser la racine déjà établie par l’appelant ; ne pas remonter silencieusement vers un autre produit ou choisir arbitrairement dans un monorepo. Sans contexte fiable : blocage de l’action concernée ou clarification, pas d’écriture dans une racine devinée. Règle du futur moteur, pas modification des règles de découverte des hôtes.

### Ce qui reste utile et distinct

- **Références relatives aux documents/preuves/code** dans index/bindings : dépendances, pas localisation du workspace.
- Chemins d’implémentation dans G4/bindings : périmètre couvert par la vérification. Connaître la racine ne dit pas quels fichiers rendent un écran ; aucun second inventaire global dans project.json.
- Activation/politique des hooks dans l’intégration de l’hôte avec accord explicite. Présence de `.product-design/` seule ne permet pas de bloquer ; aucun paramétrage d’hôte créé ou modifié ici.
- Modèle effectivement utilisé éventuellement conservé dans une provenance historique si pertinent/disponible : fait optionnel, pas liste de modèles autorisés ou configuration d’exécution.

## 3. index.json — catalogue d’autorités

**À quoi sert-il ?** Localiser les fichiers et périmètres de référence, sans recopier leur contenu ou tenir leurs hashes à la main.

Champs : schemaVersion/kind, artifacts[] avec id/kind/path/role/scopeIds, scopes[] avec id/path. Le kind natif indique comment extraire IDs/liens ; la version réelle est lue dans chaque contrat.

```json
{
  "schemaVersion": 1,
  "kind": "product-design-index",
  "artifacts": [
    {
      "id": "vision",
      "kind": "vision-document",
      "path": ".product-design/specifications/experience/00-cadre/vision.md",
      "role": "authoritative",
      "scopeIds": []
    },
    {
      "id": "requirements",
      "kind": "requirements",
      "path": ".product-design/specifications/requirements.json",
      "role": "authoritative",
      "scopeIds": [
        "review-cases"
      ]
    },
    {
      "id": "design",
      "kind": "design-contract",
      "path": ".product-design/specifications/experience/design-contract.json",
      "role": "authoritative",
      "scopeIds": [
        "review-cases"
      ]
    },
    {
      "id": "experience",
      "kind": "experience-blueprint",
      "path": ".product-design/specifications/experience/experience-blueprint.json",
      "role": "authoritative",
      "scopeIds": [
        "review-cases"
      ]
    }
  ],
  "scopes": [
    {
      "id": "review-cases",
      "path": ".product-design/scopes/review-cases/scope.json"
    }
  ]
}
```

role proposé = authoritative / derived-view ; une vue dérivée ne peut remplacer son autorité. Les exemples de fichiers sont illustratifs et partiels : ils ne constituent pas un projet lié complet ou build éligible. scopeIds vide = transversal au projet. Scopes cités existants. Plusieurs contrats sur périmètres distincts possibles ; autorités concurrentes sur même information/périmètre refusées. Vision stratégique et synthèse opérationnelle liée ne sont pas deux mêmes autorités.

**Écrivain** : workflow d’enregistrement d’autorités, en transaction. **Lecteurs** : resolver/validate/resume. L’index, à emplacement conventionnel, est le point d’entrée et ne doit pas s’auto-référencer. Les entrées internes et hashes sont extraits, pas maintenus dans ce catalogue.

Moteur parcourt aussi les racines produit, classe archives/runtime et signale fichiers non déclarés. Absence d’entrée ≠ absence d’impact. Le hook ne réécrit pas ce catalogue comme un cache.

## 4. requirements.json — besoins, règles et critères

**À quoi sert-il ?** Déclarer ce qui doit être vrai et pourquoi ; pas redécrire un écran ou recopier un résultat de test.

Enveloppe : schemaVersion/kind/revision/requirements[]. Entrée : id/type/statement/rationale/owner/decisionStatus/scopeIds/sourceRefs/acceptanceCriteria[]. type = user-need/business-rule/constraint ; decisionStatus = draft/proposed/accepted/rejected/superseded. Critère : id/criterion. Protocole/résultat référencés ailleurs, sans duplication. Contrainte non testable : dispense motivée, pas faux test.

```json
{
  "schemaVersion": 1,
  "kind": "product-design-requirements",
  "revision": "r1",
  "requirements": [
    {
      "id": "R-draft-no-send",
      "type": "business-rule",
      "statement": "Préparer un brouillon ne réalise aucun envoi externe.",
      "rationale": "Distinguer préparation, autorisation et résultat réel.",
      "owner": "product-owner",
      "decisionStatus": "proposed",
      "scopeIds": [
        "review-cases"
      ],
      "sourceRefs": [
        {
          "artifactId": "experience",
          "entityId": "F1"
        }
      ],
      "acceptanceCriteria": [
        {
          "id": "AC-no-send",
          "criterion": "Après préparation, l’état reste brouillon non envoyé."
        }
      ]
    }
  ]
}
```

Règle proposée issue d’un input stakeholder fictif, pas besoin validé. Niveau de preuve chez la source ; IDs de critères uniques dans le document. Invariant du design contract matérialisant une règle : lien explicite et revue de cohérence, pas deux règles indépendamment éditées.

**Écrivain** : personne/skill ; accepted seulement sur décision réellement obtenue. **Lecteurs** : validate/impact/contrats. Modification → décisions/scénarios/états/sources/tests dépendants à revoir, jamais build automatique.

## 5. design-contract.json — contrat Product / UX / UI existant

**À quoi sert-il ?** Synthèse des engagements du design. JSON v1 existant consommé par validateDesignContract dans scripts/workflow-evidence-contract.mjs ; [référence](../references/design-contract.md). Pas nouveau JSON Schema exhaustif livré par cette proposition.

```text
schemaVersion: 1
product: problem, value, sharedOutcome, evidenceLevel, invariants[]
personas[]: id, responsibility
scenarios[]: id*, personaId, trigger, start, end, successCriterion,
             directPath, conversationalPath, handoff, states[], recovery
components[]: id, question, representation, dataKind, source, scope,
              period, freshness, detailTarget, states[], recovery, action, metric?
ui: principalWorkspace, hierarchy, density, designSystem, viewportRationale
```

*scenario.id exigé par le compagnon blueprint, pas par design seul aux anciens contrats. Pas migration automatique des IDs historiques.

Product = problème/valeur/résultat/invariants liés à la vision MD ; UX = responsabilités/parcours/réussite/reprise ; UI = espace principal/hiérarchie/design system/viewport. conversationalPath requis v1 même sans conversation : décrire non applicable honnêtement, pas inventer un agent.

Composants : question/donnée/source/états/action. dataKind actuel = metric/calendar/status/artifact. action.kind = read/view/prepare/simulate/command. Read/view/simulate → effect none ; command ajoute reviewVersion/effectSummary/explicitActivation true. Metric ajoute version/unit/population/deduplication/zeroVsUnavailable/sameScopeAtDetail true.

**Écrivain** : skill/personne dans périmètre convenu. **Lecteurs** : validate, ideation/build/QA aux transitions, extraction du graphe. Contrat ≠ backend schema ou permission serveur. Métadonnées nouvelles en sidecar.

## 6. experience-blueprint.json — justification et traçabilité existantes

**À quoi sert-il ?** Relier inputs/questions/décisions aux états et vérifications. JSON v1 validé avec le design contract par validateExperienceBlueprint ; [référence](../references/product-experience-method.md).

| Collection | Champs principaux actuels |
|---|---|
| inputs | id/detail/evidenceLabel |
| userValues | personaId/goal/currentAlternative/valueHypothesis/costOfFailure/successCriterion/evidenceInputIds |
| deferredPersonas | personaId/rationale |
| questions | id/theme/prompt/answer/disposition/inputIds/decisionIds |
| decisions | id/detail/productImpact/uxImpact/uiImpact |
| screenStates | id/scenarioId/screenId/state/question/information/primaryAction/resultEvidence/contextReturn/decisionIds |
| verifications | id/scenarioId/criterion/evidenceLevel/screenStateIds |
| traceability | inputId/disposition et liens decisions/scenarios/states/checks, ou rationale |
| features | conversation/proactivity/presentations booleans |
| intents, conversation, proactivity, artifacts | Contrats conditionnels actuels : placement/effets/mandats/sorties natives/marques |

Inputs labels : observed-user-behavior/operational-data/stakeholder-input/external-research/inference/assumption. Question disposition : answered/assumed/blocking. Check evidenceLevel : proposed/structural/source-review/agent-walkthrough/observed-user-behavior/operational-data. Label ≠ preuve.

Contrôles actuels : chaque persona couverte/différée ; input tracé/écarté motivé ; décision liée à input traité ; état/scénario/décision/check cohérents. Check doit viser états de son scénario. Les verifications sont des critères, pas l’exécution du test.

**Écrivains** : get-context/research/ideate/revue selon phase. **Lecteurs** : validate, préparation sources, build/QA et futur impact.

### Correction importante : les brouillons

Validateur actuel **rejette blocking**, impose les collections : état prêt pour une phase, pas toute sauvegarde de découverte. Futur moteur : brouillon syntaxiquement sûr, inconnues/incomplétude visibles ; readiness stricte à la transition. Aucun receipt passed pour brouillon incomplete/blocked ; pas answer ou écran inventés pour satisfaire un validateur.

Questions bloquantes hors scope : future tranche/projection explicite avec dépendances/report motivé, sans masquer prérequis. Évolution versionnée/testée, pas capacité déjà disponible en v1.

Les intentions générales existent sans IA. Ne pas forcer features.conversation : exploiter questions/scénarios/états et leur documentation ; registre d’intentions distinct seulement si champs réellement nécessaires sans duplication.

## 7. relations.json — liens manquants, optionnels

Nouveau sidecar : endpoints qualifiés, type/direction/rationale. Ne répète pas decisionIds/scenarioIds natifs. Types et propagation définis par moteur, pas action/commande donnée par le fichier.

```json
{
  "schemaVersion": 1,
  "kind": "product-design-relations",
  "relations": [
    {
      "id": "L-rule-decision",
      "type": "depends-on",
      "from": {
        "artifactId": "experience",
        "entityId": "D1"
      },
      "to": {
        "artifactId": "requirements",
        "entityId": "R-draft-no-send"
      },
      "rationale": "La séparation préparation/envoi repose sur cette règle."
    },
    {
      "id": "L-acceptance-check",
      "type": "verifies",
      "from": {
        "artifactId": "experience",
        "entityId": "T1"
      },
      "to": {
        "artifactId": "requirements",
        "entityId": "AC-no-send"
      },
      "rationale": "Ce check examine le critère de non-envoi."
    }
  ]
}
```

| Type proposé | Direction stockée | Si cible change |
|---|---|---|
| depends-on | consommateur → prérequis | Consommateur/descendants à revoir |
| justified-by | décision → source/vision | Justification à revoir, pas bénéfice causal prouvé |
| realizes | scénario/état → besoin/intention | Réalisation à revoir |
| implements | binding → état/contrat | Implémentation potentiellement affectée |
| verifies | check → critère/état | Réexécution à envisager, résultat historique intact |
| documents | document → entité | Doc/vue à revoir, pas automatiquement gate invalidé |

Natifs extraits/dédupliqués avec origine : screenState.decisionIds = état dépendant décision ; verification.screenStateIds = check vérifiant état. Hyperlien Markdown ≠ dépendance par défaut. Cycles de parcours normaux ; cycles de dérivation rejetés. Écrit/revu par workflow ; lu par compilateur de graphe.

## 8. Les autres JSON

| Fichier | Statut | Champs / rôle |
|---|---|---|
| scope.json | Nouveau | id/title/target/outcome/owner/outOfScope/artifactIds/workflowBranch/currentBaselineId ; tranche, pas accord |
| bindings.json | Nouveau | targets(id/root/framework) et bindings(id/targetId/scopeId/screenStateRefs/route/implementationPaths/verificationRefs/testPaths) ; réalise quoi, pas testsPassed |
| source-plan.json | Existant v1 | kind/journeyId/sessionId/involved/specificationSources/context/screens ; dépendances/destination avant pixels |
| source-ledger.json | Existant v1 | kind/sourcePlanHash/records ; attempts/files/hashes/reviews/provenance/timing |
| ideation-manifest.json | Existant v1 | Comparaison/variants/inventaire figés |
| comparison / selected-screen-set | Existants v2 | Couverture/revues/sources ordonnées hash-bound |
| approved-target-set | Existant v1 | Provided/clone/historique sans fausse compétition |
| artifact-index.json | Existant v1 | artifacts(id/path/purpose/status/canonical/sha256/sourceManifest/supersededBy) ; autorité visuelle |
| request.json | Existant v1 | operation/workflow/scope/target/outcome/owner/timestamp et paths de preuves |
| G1–G5 | Existants v2 aux transitions impliquées | Verdict/critères/risques/evidence/accord de périmètre |
| receipt.json | Existant adapter | project/scope/operation/status/readyFor/dependencies/verifierHash/timestamp/reason |
| design-qa.json | Existant v1 | sources/G4/code snapshot/requiredStates/captures/interactions/findings/history/blockers/limitations/finalResult |
| changes/<id>.json | Nouveau | trigger/sourceRef/scopeIds/baseBaselineId/affectedRefs/qualification/owner/decisionRef/resolutions/evidenceRefs |
| results/<id>.json | Nouveau | checkRef/scopeId/evaluatedBaselineId/method/time/outcome/evidenceRefs/limitations |
| baseline.json | Nouveau | id/project/scope/time/previous, dépendances versions/hashes, bindings/sources/approvals/results/limites |
| runtime/graph.json | Dérivé nouveau | fingerprint/version/inputs, nodes refs/hash, edges types/origines |
| runtime/freshness.json | Dérivé nouveau | baseline, changed files/affected refs/causes/coverage/time |
| runtime/resume.json | Dérivé nouveau | scope/baseline, autorités/blockers/inconnues/nextAction |

Nouveaux formats : conventions version/kind ci-dessus ; pas d’enveloppe automatique des v1. Champs exacts existants : [Source artifacts](../references/source-artifacts.md), [Transitions](../references/executable-transitions.md), [Artifact index](../references/artifact-index.md) et validateurs.

Précisions importantes :

- scope.phaseHint éventuel est indicatif ; readiness vient des preuves. Discovery sans build : pas gates fictifs.
- bindings : fichier non lié dans racine surveillée → couverture unknown/conservatrice. Hotfix constaté ≠ règle acceptée.
- Source plan : specs id/path/sha256/revision/authority ; context hashes ; screens purpose/role/nextScreen/attemptLimit et links spec/scenario/decision/state/check. Involved exige liens non vides vérifiés. Nouveau plan/revue si changement, jamais réécriture de plan lié à l’histoire.
- Ledger : review liée aux octets, provenance tool/prompt/refs, timing ; userApproved false/runtimeVerified false. Inspection ≠ accord utilisateur ≠ QA ; pas nouvel attempt après acceptation dans le même plan.
- artifact-index **distinct du nouvel index global** ; accepted/rejected/history/canonical par purpose importés, pas statuts recopiés.
- Request ≠ accord ; receipt écrit par adapter ≠ résultat produit. consume recontrôle files juste avant action. Layout par scope/QA nécessite migration.
- Change : script propose impact ; revue qualifie/autorise. Événement technique ≠ changement métier accepté.
- Result : réel, lié à version et protocole ; étude avec population/consentement appropriés sans données personnelles brutes. Critère modifié ne supprime pas un résultat ancien.
- Baseline : immuable publiée, octets/preuves disponibles, pas simple commitId. Pointeur publié après transaction réussie ; baseline ne donne pas autorisation de build.
- Cache/runtime régénérables, hors Git. Sans baseline freshness unknown. Cache périmé n’autorise rien ; reçus/proofs historiques intacts, applicabilité actuelle dérivée.

## 9. Scripts : oui, un moteur partagé

**Oui, les handlers pourront résoudre .product-design/index.json depuis le contexte de répertoire et invoquer le moteur lisant les fichiers utiles. Aucun project.json ni changement de configuration des modèles nécessaire. Les hooks restent un déclencheur parmi d’autres.**

```text
Skill / invocation explicite / CI / hook compatible
  → resolver (contexte de répertoire, index, scope ; activation externe du hook)
  → loader + validation syntaxe/schéma/références
  → reconcile (files réels, baseline, transactions)
  → graphe dérivé + impact
  → rapport / reprise / contrôle de transition
```

Ce moteur est proposé. Actuellement check-workflow-evidence/check-source-artifacts lisent leurs formats existants, **pas les nouveaux index/requirements**.

| Déclencheur | Lectures | Écritures cibles | Ne fait pas |
|---|---|---|---|
| Reprise par skill | Contexte de répertoire/index/scope/autorités/baseline utiles | Résumé dérivé si demandé | Charger toute archive |
| AfterFileEdit | Contexte d’appel/path/cache vérifiés | Signal dirty idempotent, impact borné | Suite lourde, update métier, build |
| Reconcile explicite/CI | Racines/index/deps/baseline | Rapport, checkpoint si autorisé | Accord humain |
| PreToolUse sur transition identifiée | Contexte d’appel/request/proofs et **files réels** | allow/block et diagnostic | Autoriser sur cache seul, sandbox regex shell |
| Transition par skill | Autorités/proofs/files | Archives/snapshots/receipt transactionnels | Fabriquer approbation |
| Test/recherche effectué | Version/protocole/captures | Result/QA avec preuves | Benefit déduit d’un succès outil |

Hook d’observation peut simplement marquer dirty ; reprise/transition contrôlent réellement les octets. Compromis de latence sans autorité du cache. Contrôle trop lourd pour hook : passer par adapter et politique d’échec compatible, pas tests/captures/LLM/réseau lourds en hook.

Éditeur externe/shell/wrappers : événements non garantis ; reconcile inclut ajouts/suppressions. Transition ne dépend pas d’AfterFileEdit reçu. Pas watcher permanent ; CI/ordonnanceur séparés seulement sur demande. Projet inconnu : aucune écriture/blocage ; association session/projet fiable indispensable.

**Lire ≠ injecter ≠ décider.** Script vérifie ; skill/reviewer qualifie le sens et consomme explicitement resume/impact. stdout hook ≠ injection garantie au modèle. Handler n’exécute jamais des commandes définies dans les données.

## 10. Cause → effet : trois niveaux

**Technique observable** : édition → événement si émis → handler vérifie projet → dirty ; reconcile confirme hash → dépendances inverses → needs-review. Journalisable avec limites.

**Justification déclarée** : règle R justifie D, D réalisée par SS, SS implémentée par route. Analyse d’impact, pas preuve de bénéfice.

**Hypothèse de valeur** : montrer la cause aide à prioriser. Alternative/baseline/protocole/observations nécessaires ; pas prouvé par hash/justifies/maquette.

```text
R-draft-no-send change
  → D1 depends-on R (relations)
  → SS1 dépend de D1 (decisionIds natif)
  → T1 vérifie SS1 (screenStateIds natif)
  → binding route/composant de SS1
  → sources/approvals/QA anciennes à recontrôler
```

Automatique permis : changed R, needs-review D1/SS1/T1/binding, applicability stale des preuves dépendantes, causes/versions exposées. **Interdit : prepare → command, effacer ancienne QA, userValidated, refaire images ou intégrer envoi réel.**

Revue : prose sans impact, comportement nouveau nécessitant accord/tests, ou report motivé. no-semantic-impact lié aux nouvelles révisions ; vieux receipt sur vieux octets jamais déclaré frais. Code-first : snapshot/QA d’implémentation affectés → observed-vs-target → revue ; pas changement automatique de spec.

## 11. Réalisation et vérification

Schémas versionnés/fixtures résolues → resolver/loader/draft validate/extraction native → graph/reconcile/impact/reprise/baselines → migration scope/QA/source roots → skills/CI → hooks observe réels puis guard-transitions ciblées.

Un écrivain actif/projet, confinement, transactions interrompues visibles, secrets hors journaux ; aucun modèle JSON ne constitue à lui seul une maintenance opérationnelle.

### Vérification effectuée / Verification Completed

Champs existants vérifiés dans workflow-evidence-contract.mjs, source-artifacts.mjs et références liées. Design seul n’impose pas scenario.id ; blueprint le requiert et rejette blocking ; plans/attempts hash-bound.

Docs Goose relues depuis copies obtenues via carte officielle le 2026-10-19 : [Hooks](https://goose-docs.ai/docs/guides/context-engineering/hooks) pour événements/observation/blocage/pannes/limites ; [Skills](https://goose-docs.ai/docs/guides/context-engineering/using-skills) pour instructions chargées ; [Plugins](https://goose-docs.ai/docs/guides/context-engineering/plugins) pour séparation composants/données. Compatibilité hôte à vérifier avant activation (layout/noms/on_failure).

Document de design, **pas validation par nouveaux JSON Schemas**. Exemples fictifs. Aucun hook/runtime/config modifié. Tests du dépôt protègent l’existant, pas encore moteur/hook réel ou UX mesurée.

**Prochaine étape : nouveaux schémas versionnés et fixtures liées, puis lecture/reconcile/impact sans dépendance aux hooks.**
