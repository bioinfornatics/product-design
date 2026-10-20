# Proposition minimale — Spécifications produit, Beads et provenance Entire

Statut : **révision de proposition, non implémentée**, 2026-10-19. Ce document est la proposition de référence ; il corrige [l’inventaire initial](product-memory-proposal.md) et [les formats explorés](product-memory-schemas.md). Révision demandée : réutiliser Beads pour la mémoire du travail et Entire, facultativement, pour la provenance de développement. La mémoire produit et sa migration restent non implémentées. L’onboarding facultatif est désormais livré séparément dans [le contrat canonique](../references/tooling-onboarding.md) et son preflight read-only ; aucun tracker, hook ou plugin installé n’est activé par cette révision.

[Cycle de vie, skills, fonctions et exploration de graphe](product-lifecycle-graph.md) précise les appels existants et proposés, les limites des hooks et une méthode Retrieve → Traverse → Explore → Verify. Une traversée de la fixture blueprint a été exécutée ; un reader explicite specs/références/Beads et des diagnostics de capacités/annotations sont désormais livrés dans [le contrat lifecycle](../references/product-lifecycle-reasoning.md). La jointure automatique Entire, les hooks et la migration de stockage restent non implémentés. Ce complément ne remplace pas les autorités définies ici.

## 1. Verdict par soustraction

**Ne pas reconstruire ce que les outils savent déjà stocker et retrouver.** La couche à ajouter relie leurs informations ; elle ne devient ni tracker, ni journal universel, ni service de mémoire.

| Information | Autorité par défaut | Consommateur / opération | Échec sans cette information |
|---|---|---|---|
| Vision, principes et pourquoi durable | Markdown produit | Personne/agent : comprendre et arbitrer | Une nouvelle session ne retrouve pas les intentions |
| Décisions, scénarios, états et critères structurés | Contrats produit existants | Skills/validateurs : préparer sources et contrôler les phases | Les consommateurs de phase perdent leurs engagements et liens |
| Pourquoi de la tâche, périmètre du travail, discussion, résolution | Beads lorsque le suivi est actif | Personne/agent : reprendre ou expliquer le travail | La raison d’un correctif se réduit au diff ou à la conversation |
| Dépendances et relations entre travaux | Relations natives Beads | CLI Beads : chercher, traverser, planifier | Prérequis et travaux antérieurs deviennent difficiles à retrouver |
| Modification réelle des fichiers | Fichiers courants et Git si disponible | Diff, revue, identification de révision | On confond intention et implémentation |
| Conversation de développement capturée | Entire, seulement si disponible et autorisé | CLI Entire : expliquer une révision/session | Le détail des alternatives discutées peut manquer ; pas de vérité produit perdue si elle a été publiée |
| Résultat réellement observé sur des bytes précis | Preuves/archives/QA existantes | QA et transition : vérifier l’applicabilité | Une tâche fermée ou un commit devient à tort une preuve de réussite |
| Liens entre ces autorités | Au point où le lien est utile, sans copie inverse auteur | Lecture ciblée et contrôles de références | Un ID de tâche ne permet pas de retrouver la décision ou le test concerné |

Conséquences : aucun project.json ; aucun index auteur, tasks.json, change-log.json, relations.json ou baseline globale obligatoire. Pas de copie de base Beads ni de transcript Entire dans la mémoire produit. Pas de document de rationale pour chaque frappe. Un catalogue et les backlinks éventuels sont dérivés et supprimables.

Le design-contract et l’experience-blueprint restent pour leurs consommateurs actuels, pas parce que leur découpage serait idéal. Ils se chevauchent sur la valeur et le succès ; leur unification exige de choisir un auteur et une projection, avec migration des validateurs. Cette révision ne crée ni troisième contrat ni synchronisation bidirectionnelle.

## 2. Organisation et autorité

Une seule racine de mémoire produit : PROJECT_ROOT/.product-design. PROJECT_ROOT est fourni par le contexte d’exécution établi ; PD_ROOT en découle. Aucun emplacement d’hôte, provider ou modèle n’est déclaré dans les fichiers produit. Un contexte monorepo ambigu bloque les écritures, pas une explication générale.

| Emplacement cible | Contenu | Création |
|---|---|---|
| .product-design/README.md | Navigation humaine courte, pas registre de tâches | Quand la mémoire est réellement utilisée |
| .product-design/specifications/experience/00-cadre à 06-validation | Cadre, service, personas, parcours, intentions, écrans fonctionnels, validation | Au besoin, pas sept dossiers obligatoirement remplis |
| .product-design/specifications/experience/ | Contrats existants lorsque la phase les exige | Pas de JSON complet imposé à la découverte |
| .product-design/evidence/ | Sources/preuves dont la destination permet ce stockage, rapports et archives de phase | Selon opération, après migration coordonnée |
| .product-design/runtime/ | Vues et caches dérivés éventuels | Seulement si une opération en bénéficie |

Beads conserve son stockage natif .beads/ et Entire son stockage/configuration natifs ; Git conserve son propre historique. Ces outils ne sont pas imbriqués dans .product-design. Une configuration Entire ou Beads n’est pas une spécification produit.

**Écart actuel :** l’adaptateur impose encore .gates/ et design-qa.json/design-qa.md à la racine. Les sources générées sont directement écrites sous generated/product-design/... selon leur contrat d’outil ; les annotations sont sous .goose/annotations/. Ne rien déplacer ni copier pour simuler la nouvelle architecture. Migrer résolveurs, exclusions de snapshots, scripts, skills, références, templates/ports et tests ensemble ; préserver les bytes/provenances historiques et les contraintes de destination du générateur. La cible n’a pas de .gates/ séparé à la racine.

### Une information, un propriétaire

- **Produit durable :** pourquoi la règle existe, quel comportement reste voulu et quels critères s’appliquent, dans les spécifications. La décision structurée n’est pas un résumé concurrent de pages de prose.
- **Travail :** pourquoi cette tâche a été ouverte, ce qu’elle change et sa résolution, dans Beads. Les critères propres au travail restent dans la tâche ; ceux du produit sont référencés, pas recopiés comme seconde autorité.
- **Provenance :** ce qui a été discuté/exécuté pendant une session, dans Entire si capturé. Une proposition abandonnée dans un transcript ne remplace pas une décision publiée.
- **Observation :** ce qui a été vérifié et ses limites, dans le résultat de vérification. Les critères du blueprint ne sont pas des résultats d’exécution.

Une décision Beads peut être l’auteur du raisonnement d’un arbitrage, mais ce choix doit être explicite : pas d’ADR MD identique édité séparément. Par défaut, toute règle gouvernant encore le produit est compréhensible localement sans devoir ouvrir un transcript ou retrouver une tâche purgée. Une dépendance durable à une décision Beads exige accessibilité, rétention et identification de sa révision réellement revue ; elle n’est pas activée dans le premier socle. Une éventuelle publication locale est revue avec transfert d’autorité explicite, pas une seconde décision indépendante.

## 3. Ce que nous réutilisons, sans nouveau moteur

### Beads : mémoire de travail et graphe de tâches

Le CLI installé fournit descriptions, notes de design, critères, commentaires, metadata, référence de spécification, type decision, recherches, historique et relations. Réutiliser les relations natives pour les tâches : blocks, parent-child, discovered-from, caused-by, validates, supersedes ou related, selon leur sens et la version installée. Ne pas dupliquer ces arêtes dans un graphe JSON produit.

Un blocage de tâche n’est pas une justification produit. Une relation caused-by est une déclaration d’explication, pas une causalité démontrée. La clôture d’une tâche n’est ni fraîcheur des sources, ni QA actuelle, ni validation utilisateur. Les statuts ready/blocked Beads indiquent le travail disponible, pas une permission G4/G5.

La recherche historique doit inclure les tâches fermées ; dans bd 1.1.2, la recherche les exclut par défaut et le texte libre vise les titres, avec filtre spécifique pour la description. Lire discussion et historique au besoin, puis traverser les relations pertinentes. Une recherche de titres seule ne garantit pas d’avoir retrouvé tout le rationale.

Lire via le CLI, pas via un parser de la base ou d’un export supposé canonique. Vérifier le tracker effectif via son contexte : la présence de .beads/ ou un préfixe d’issue ne prouve pas à elle seule l’association au produit. Beads gère sa persistance, ses transactions et sa synchronisation ; ces garanties ne couvrent pas simultanément les fichiers MD/JSON.

L’historique réellement disponible dépend des révisions conservées et de la politique de commit/maintenance de la base. Ne pas annoncer une version durable par simple présence de bd history. Les souvenirs persistants Beads peuvent porter du contexte de travail ; ne pas y réécrire une règle produit comme seconde autorité.

### Git et Entire : retrouver la fabrication

Git fournit diffs/révisions des fichiers commités ; lire aussi les fichiers modifiés, nouveaux et supprimés hors commit. Aucun commit automatique pour obtenir de la provenance.

Entire relie nativement un commit à son checkpoint via Entire-Checkpoint. Réutiliser ce lien au lieu de tenir une table commit/checkpoint parallèle. Le CLI d’explication fournit une enveloppe JSON de metadata séparée du transcript ; ne pas prétendre que le JSON contient la conversation. Consulter le transcript uniquement si la question le nécessite et si l’accès est autorisé. La génération d’un résumé est une opération distincte, avec écriture et coût modèle, pas une simple lecture.

Une tâche doit être explicitement associée à la révision pertinente, dans sa résolution/référence existante ou dans le message du commit autorisé. Ni proximité temporelle ni présence dans un même checkpoint ne prouvent cette association ; un commit peut couvrir plusieurs tâches. Sans commit/checkpoint, garder honnêtement une résolution de travail et des preuves liées aux bytes courants, sans fabriquer de provenance Entire.

**Observations locales du 2026-10-19 :** le premier relevé trouvait bd 1.1.2, tracker product-design existant/Dolt embedded, et Entire 0.11.5 sans configuration locale. Depuis, l’utilisateur a activé Entire pour le développement du plugin et confirme le support externe Goose ainsi que `entire enable --agent goose --telemetry=false`. Le status natif indique enabled avec synchronisation origin ; l’absence de Goose dans une liste built-in ne réfute pas cette intégration. Aucun checkpoint/transcript de cette conversation n’a été vérifié. Cette configuration de développement ne doit pas être copiée dans les produits cibles.

## 4. Les seuls nouveaux liens à définir

Deux catégories restent : navigation vers l’information actuelle et identité des entrées effectivement revues. **Un lien de navigation n’est pas automatiquement une dépendance d’approbation.**

| Lien | Où le conserver | Information minimale | Contrôle utile manquant |
|---|---|---|---|
| Tâche → document produit | spec-id ou lien de description Beads existant | Chemin relatif au produit | Le document existe et appartient au produit établi |
| Tâche → entité/section précise | Metadata de la tâche seulement si nécessaire | Relation, chemin, collection/ID ou ancre explicite | L’entité existe, l’ID n’est pas ambigu, la portée est déclarée |
| Raisonnement MD → décision/état JSON | Lien local structuré là où vit le raisonnement | Même sélecteur fichier/entité | Résoudre la justification sans copier le texte ni écrire un backlink inverse |
| Tâche → tâche/decision Beads | Relations natives Beads | IDs dans le tracker vérifié | Réutiliser le CLI ; ne pas recréer son contrôle de graphe |
| Tâche → modification | Résolution/référence de révision existante | Commit Git exact lorsqu’il existe | Vérifier la révision déclarée et examiner son diff ; pas déduire le sens depuis le timestamp |
| Commit → provenance Entire | Association native Entire | Trailer et checkpoint existants | Résoudre localement si disponible ; signaler absence, sans inventer un transcript |
| Tâche → vérification | Référence de résultat dans la tâche | Chemin du résultat | Consommer son identité/portée via le vérificateur existant ; pas donner l’autorité au statut de tâche |
| Preuve/approbation → bytes évalués | Plans, reçus et archives existants | Dépendances, hashes et bytes accessibles | Réutiliser publication/consume ; pas baseline supplémentaire |

### Convention minimale proposée pour les références fines

Le lien document suffit au petit changement. Quand plusieurs entités ou un contrôle d’impact ont besoin de structure, proposer uniquement un namespace metadata Beads product-design, sans nouveau fichier de registre :

~~~json
{
  "product-design": {
    "schemaVersion": 1,
    "references": [
      {
        "relation": "affects",
        "path": ".product-design/specifications/experience/experience-blueprint.json",
        "entity": { "collection": "decisions", "id": "D1" }
      },
      {
        "relation": "explained-by",
        "path": ".product-design/specifications/experience/00-cadre/principes.md",
        "anchor": "preserve-draft"
      },
      {
        "relation": "verified-by",
        "path": ".product-design/evidence/qa/review-one.json"
      }
    ]
  }
}
~~~

Exemple fictif de **convention à implémenter**, pas format livré par Beads ni JSON opérationnel actuel. references est facultatif ; relation/path sont nécessaires si un lien structuré est présent. entity ou anchor sont facultatifs et mutuellement exclusifs ; sans eux le document entier est visé. Pas de projectId, root, modèle, owner, statut de tâche ou copie de rationale : le contexte/runtime et Beads possèdent déjà ces informations.

- affects déclare les cibles du travail, pas une liste exhaustive prouvée d’impacts.
- explained-by permet la navigation vers une raison ; la matérialité pour l’approbation est revue séparément.
- verified-by vise un **résultat** de contrôle. Un critère T1 encore proposed peut être une cible affects, jamais un test passé par simple lien.
- Path est relatif à PROJECT_ROOT et confiné après résolution réelle ; pas de traversée ou de sélection implicite d’un autre produit.
- entity recherche l’ID dans une collection supportée du contrat, pas par position de tableau. anchor est explicitement stable, pas le slug calculé d’un titre ou un numéro de ligne.

Pour MD, réutiliser une convention équivalente de liens structurés en frontmatter lorsque la résolution d’entités est nécessaire ; son parser reste à écrire. Pas de second DSL ni changement arbitraire des schémas JSON v1. Les liens natifs decisionIds/scenarioIds/screenStateIds/verificationIds restent propriétaires dans leurs contrats. Les backlinks sont dérivés depuis les références locales et les réponses CLI Beads ; un résultat de recherche incomplet est signalé, pas transformé en graphe exhaustif.

Les liens ci-dessus visent le courant. Une revue historique utilise la révision/les bytes archivés par l’évidence existante, pas un hash obligatoire sur chaque lien. Un fichier rationale matériel rejoint specificationSources du plan existant lorsque cette phase le consomme. Un hash changé exige revue ; le remplacer ne renouvelle pas l’accord. Pour une preuve historique de rationale Beads, une référence à la tâche actuelle seule serait insuffisante : nécessiter révision retenue ou extrait exact archivé légalement pour cette revue, jamais exporter toute la base par défaut.

Une association tâche/fichiers Git est utile mais grossière : elle ne prouve pas quelle fonction implémente SS1. **Pas de bindings.json dans le socle.** Ajouter un binding état/test/code à son emplacement existant seulement si un test ciblé ou un contrôle d’impact l’utilise réellement ; demander une revue de portée sinon.

## 5. Les contrôles à ajouter — et ceux à réutiliser

| Contrôle | Ce qui existe déjà | Ajout minimal proposé / limite |
|---|---|---|
| Contexte | Résolveurs de phase ; bd context ; association Git | Vérifier que fichiers/tracker/révision appartiennent au produit courant ; sans config racine produit |
| Références internes produit | validateExperienceBlueprint et liens de plan | Résolution des liens MD et des références fines dans metadata Beads ; pas revalidation du graphe Beads |
| Révisions et provenance | Git, historique Beads disponible, association Entire | Assembler une lecture ciblée et indiquer resolved/unavailable/unknown ; pas miroir de leurs données |
| Brouillon | Les validateurs de phase rejettent certains incomplets/blocking | Validation syntaxe/IDs/liens applicable au draft ou MD de découverte ; ne pas inventer des réponses pour passer |
| Fraîcheur source/QA | sourceImpact, hashes, snapshots, archives et consume | Inclure la raison matérielle parmi les dépendances de phase ; ne pas réécrire l’algorithme existant |
| Cohérence tâche/résultat | assertBeadsClosure pour les phases suivies | Vérifier résultat/portée/révision référencés lors de la clôture ; closed ne signifie pas QA actuelle |
| Effet métier et contradiction | Contrats d’effets + revue agent/humaine | Signaler le conflit et demander l’arbitrage requis ; pas décision métier par script |
| Écriture concurrente | Persistance native Beads ; écritures fichiers de l’adaptateur | Détecter révision lue périmée pour documents ; intégrer de façon sérialisée, pas transaction distribuée |

Une tâche ancienne closed et une QA devenue stale ne sont pas forcément contradictoires : la tâche peut avoir été correctement terminée à l’époque. Signaler l’applicabilité historique plutôt que rouvrir toute l’histoire. Une tâche qui revendique une QA actuelle absente/incohérente doit être corrigée avant de soutenir cette revendication.

Aucune mise à jour Beads ne déclare un impact nul, renouvelle un accord source ou fabrique userValidated. Ni Git, ni Entire, ni une recherche de tâches ne prouvent bénéfice utilisateur, droits backend ou approbation authentifiée.

**Portée des garanties :** vérifier expected hash avant remplacement contrôlé d’un document ; un seul writer d’intégration/transition au départ. Ne pas annoncer un compare-and-swap atomique sur les mises à jour Beads sans API vérifiée. Une transaction Beads ne rend pas atomiques MD + JSON + base + reçus. Une interruption conserve un draft/une tâche partiellement mise à jour et interdit une nouvelle readiness incohérente.

## 6. Lecture, prompt et modification

Goose découvre noms/descriptions de skills au début de session, puis charge les instructions pertinentes. Cela ne charge pas automatiquement les specs ou la base Beads. Le skill doit explicitement lire fichiers et résultats CLI ; la proposition n’est pas un mécanisme de contexte déjà installé.

1. **Classer le prompt** : question, exploration, demande de travail, décision, correction ou résultat. Un prompt ne crée pas automatiquement une tâche ni un accord.
2. **Résoudre le produit et les capacités** : lire contexte ; vérifier association Beads ; Entire est facultatif et son absence n’autorise aucune simulation.
3. **Lire le courant** : principes/décisions/scénarios/états/checks pertinents ; ne pas charger tout l’historique.
4. **Retrouver le travail** : Beads si actif, tâches fermées incluses pour une question historique, puis relations/discussion. Entire/Git seulement quand la fabrication explique la question.
5. **Qualifier** connu, supposé, manquant, contradictoire, stale ; citer l’autorité et la révision réellement accessible. Une contradiction bloque l’action dépendante, pas toute découverte.
6. **Choisir le propriétaire du changement** : tâche Beads pour le travail ; spécification pour une intention durable changée ; code pour correction d’implémentation ; preuve pour résultat observé.
7. **Préparer et intégrer** un diff ciblé avec raison/références utiles, revue matérielle et conflits. Mettre à jour seulement le propriétaire, pas toutes les couches systématiquement.
8. **Contrôler puis poursuivre** : utiliser les vérificateurs existants et le consume frais de la transition applicable ; rapporter la résolution et les limites.

Un correctif conforme à D1 existant peut se limiter à tâche + code + preuve : pas nouvelle décision ni ADR. Un changement d’intention exige révision de la décision/règle et de ses consommateurs. Un hotfix code-first crée d’abord un écart observé/cible ; ne pas réécrire les specs comme si l’intention avait déjà été acceptée.

MD/JSON : références entre informations distinctes ; ou vue MD séparée dérivée du JSON auteur ; ou compilation déterministe de champs MD explicitement structurés. Jamais synchronisation bidirectionnelle. Un résumé LLM de prose/transcript est une proposition à revoir. Une vue générée éditée est divergente, pas réimportée silencieusement.

## 7. CRUD et cycle de vie, sans nouveau journal

| Opération / moment | Mécanisme retenu |
|---|---|
| Créer | Documents au besoin ; Beads pour travail réellement suivi ; plans avant pixels ; résultats seulement à partir d’exécution ou not-run honnête |
| Lire | Spécifications actuelles d’abord pour intention ; Beads pour travail ; Entire/Git pour provenance ; résultat exact pour observation |
| Mettre à jour | Modifier l’autorité pertinente et ses liens matériels ; conserver raisons/alternatives au bon endroit ; vérifier conflits et impact |
| Retirer | Brouillon non référencé supprimable après contrôle ; entité référencée à migrer/retirer explicitement ; pas effacement d’anciens constats pour passer QA |
| Clore une tâche | Résolution et liens vérifiés à cette date ; anciennes tâches closes restent historiques, pas permissions permanentes |
| Purger/compacter | Maintenance native Beads/Entire sous politique autorisée ; ne pas perdre l’unique rationale encore requis ni promettre rétention illimitée |
| Reprendre sans conversation/cache | Reconstruire références locales, interroger CLI disponible, relire preuves ; ce qui n’a jamais été enregistré reste inconnu |
| Changer de branche/clone | Recontrôler produit, tracker, révisions et bytes ; ne pas déduire synchronisation DB/checkpoints d’un Git checkout |
| Mettre à jour le plugin | Vérifier versions supportées ; migration explicite, jamais renouvellement automatique d’accord |

Découverte peut s’arrêter sans build. Nouveau multi-step : trois parcours complets comparables, G2 sélection, G3 sources corrigées complètes, G4 autorisation frontend scoped, G5 capture/comparaison/interactions et preuves. Cible fournie, clone exact, audit et sélection historique gardent leurs branches sans compétition fictive. G6/G7, backend, services et release production ne sont pas implémentés par l’adaptateur actuel ; ils demandent phase explicite et contrôles d’ingénierie du produit. Le retour d’usage nécessite observation autorisée ; code livré et tâche close ne mesurent pas la valeur.

Beads reste facultatif pour le plugin. Si absent, conserver le rationale utile dans les documents existants, sans créer un tracker JSON de secours. Une référence historique indisponible se signale ; elle ne bloque pas toute découverte. Si elle est le seul fondement matériel d’un arbitrage requis, ne pas poursuivre cet arbitrage avant clarification ou publication revue.

## 8. Hooks : ne pas doubler Beads ou Entire

Première implémentation **sans hooks** : reader de références et rapport d’impact via skill/invocation explicite, utilisable aussi en CI. Ensuite seulement un hook d’observation borné si son gain est démontré. Aucun watcher permanent, capture de prompt, collecte de transcript ou générateur de tâches supplémentaire.

- AfterFileEdit peut signaler dirty après un edit Goose réussi ; les éditeurs externes et mutations shell/wrappers ne sont pas tous couverts. Reconcile à la lecture/transition reste nécessaire.
- UserPromptSubmit est observation-only : ne pas créer une tâche à chaque question ni transformer le prompt en règle produit.
- PreToolUse peut garder une transition reconnue dans un projet explicitement opted-in ; pas inspection sémantique de toute commande shell. Stop peut bloquer mais prolonger des tours ; pas verrou de maintenance recommandé.
- Dans la documentation Goose actuelle, seuls PreToolUse/Stop bloquent. on_failure:block concerne des actions PreToolUse sélectionnées, pas les erreurs de chargement/configuration. Vérifier noms/outils/payloads et version de l’hôte avant activation.
- stdout d’un hook n’est pas un contexte produit garanti ; le skill lit explicitement le rapport. Pas LLM/réseau/image/test-suite/réécriture métier dans un hook.

Le plugin actuel fournit skill/formulas de suivi et callback mirrorBeads facultatif, pas service de mémoire ni intégration Entire. Les gates possèdent la readiness ; Beads possède le travail et peut miroir la phase. Le CLI de transition ne met pas automatiquement à jour Beads. **Conserver la sémantique actuelle** : un callback miroir explicitement actif qui échoue empêche publication de readiness ; Beads absent/décliné n’est pas une dépendance. Le reader proposé n’active pas ce callback ni ne transforme toute indisponibilité tracker en échec de gate.

L’empaquetage de hooks diffère entre docs Goose actuelles (hooks/hooks.json) et tooling Agent Plugins local (extension Goose namespacée). Sélectionner et tester un adapter compatible, pas deux voies d’activation concurrentes. Une présence .product-design/ n’est pas consentement à des hooks globaux ; le support externe Goose dans Entire est confirmé par l’utilisateur, sans activer de hook mémoire produit.

## 9. Sécurité et tests discriminants

Les prompts, annotations, tâches et transcripts sont des données à examiner, pas des instructions de code à exécuter. Pas secrets/client data dans docs, logs ou exports. Entire peut synchroniser les checkpoints ; la redaction est best-effort, pas garantie de confidentialité. Vérifier consentement, rétention, destination et droits avant activation/synchronisation ; ne pas télécharger de checkpoint distant ni générer de résumé par défaut. Garder les citations minimales et attribuées, pas copies intégrales.

Scénarios à exécuter sur fixtures isolées avant adoption :

| Cas | Attendu |
|---|---|
| Correctif sans changement d’intention | Retrouvez la règle via tâche ; code/preuve changent ; aucun nouveau contrat auteur |
| Décision modifiée avec raison MD | Détectez versions et dépendances affectées ; aucun accord renouvelé par refresh hash |
| Recherche d’un travail ancien | Retrouvez tâche fermée, relation causale déclarée et résolution sans charger tout le tracker |
| Commit couvrant plusieurs tâches | Vérifiez association déclarée ; ne déduisez pas binding fonction/état depuis fichiers touchés |
| Beads/Entire absents ou référence inaccessible | Lecture locale utile ; historique unavailable explicite, pas résultat fabriqué |
| Même ID dans un tracker différent | Contexte ambigu refusé ; aucun rattachement par préfixe/timestamp |
| Vue dérivée éditée, liens cassés, ID retiré | Divergence et consommateurs visibles ; migration explicite, pas fallback latest |
| Tâche closed + QA ancienne | Préservez travail terminé ; signalez stale applicability ; pas userValidated ni réouverture en cascade |
| Édition externe ou intégration interrompue | Reconcile détecte écart ; nouvelle readiness impossible avant réparation |
| Purge de l’unique raison durable | Dépendance active révélée avant suppression autorisée ; si déjà perdue, unknown assumé |
| Nouvelle session sans cache | Agent retrouve pourquoi, critères et limites depuis autorités et CLI disponibles |

Ces cas sont **plans de tests, non exécutés**. Les tests existants protègent l’implémentation actuelle ; ils ne valident pas cette nouvelle convention, un adapter Entire/Goose, la récupération comportementale ou la valeur utilisateur.

## 10. Plan d’implémentation réduit

1. Sur fixture : une raison MD, D1/SS1/T1 existants, une tâche Beads et un résultat de vérification ; Entire facultatif uniquement sur checkpoint réellement disponible. Fixer autorités et rétention sans double écriture.
2. Implémenter la résolution des seules références fines utiles + rapport de lecture depuis fichiers/CLI. Pas nouveau graphe auteur, pas hooks, pas écritures tracker automatiques.
3. Tester brouillons/conflits, tâches closes, mauvais tracker, indisponibilité et éditions externes ; relier les raisons matérielles aux contrôles de source/consume existants.
4. Évaluer agent avec/sans ces références : retrouve-t-il le pourquoi, préserve-t-il l’inconnu, distingue-t-il critère et résultat ? Implémenter écritures scoped seulement après ce test.
5. Traiter migration des chemins puis adapters/hooks opt-in comme chantiers séparés, avec tests de non-régression et privacy. Ne pas installer/activer implicitement Beads/Entire.

Succès : moins d’informations dupliquées, pourquoi retrouvable sans conversation, tâche reliée à intention et résultat, anciennes preuves préservées, fichiers dirty pris en compte, absence d’outil supportable et coût de lecture proportionné. Pas besoin de sérialiser chaque modification pour y parvenir.

## Vérification effectuée / Verification Completed

Sources consultées : [Beads](https://github.com/steveyegge/beads), [Entire CLI](https://github.com/entireio/cli) et aide des versions installées ; contexte tracker et liste des agents Entire inspectés en lecture seule, sans lire ni recopier les conversations. Ces constats sont datés, pas garanties pour toutes les versions.

Goose : [Plugins](https://goose-docs.ai/docs/guides/context-engineering/plugins) pour container/composants ; [Skills](https://goose-docs.ai/docs/guides/context-engineering/using-skills) pour découverte/chargement ; [Hooks](https://goose-docs.ai/docs/guides/context-engineering/hooks) pour événements, limites et blocage. Références runtime relues : [transitions](../references/executable-transitions.md), [sources](../references/source-artifacts.md), [tracking](../references/planning-and-tracking.md) et [méthode/blueprint](../references/product-experience-method.md). Aucun nouveau parser/schema/handler, migration ou intégration n’est livré par cette révision documentaire.

**Prochaine étape : éprouver sur une fixture le lien tâche → raison/décision/état → résultat, y compris tâche fermée et outils absents, avant d’implémenter le reader.**
