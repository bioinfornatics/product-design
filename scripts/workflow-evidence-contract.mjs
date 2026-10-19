#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { manifestFingerprint, validateIdeationManifest } from "./ideation-contract.mjs";

const fail = (message) => { throw new Error(message); };
const text = (value, label) => { if (typeof value !== "string" || !value.trim()) fail(label + " is required"); };
const member = (value, values, label) => { if (!values.includes(value)) fail(label + " is unsupported"); };
const nonempty = (value, label) => { if (!Array.isArray(value) || !value.length) fail(label + " must not be empty"); };
const digest = (value, label) => { if (!/^[a-f0-9]{64}$/.test(value)) fail(label + " must be SHA-256"); };
const iso = (value, label) => { if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) fail(label + " must be an ISO timestamp"); };
const absolute = (value, label) => { text(value,label); if (!path.isAbsolute(value) || path.normalize(value)!==value) fail(label + " must be an exact absolute local path"); };
const sorted = (value) => Array.isArray(value) ? value.map(sorted) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,sorted(value[key])])) : value;
export const canonicalJson = (value) => JSON.stringify(sorted(value));
export const sha256 = (value) => createHash("sha256").update(typeof value === "string" || Buffer.isBuffer(value) ? value : canonicalJson(value)).digest("hex");
const phaseOrder = { ideation:1, build:2, industrialization:3 };
const verdicts = ["pass","conditional","experiment","blocked"];
const essential = ["problemClarity","userImportance","outcome","productValue","measurableSuccess"];
const weights = {problemClarity:20,userImportance:15,outcome:15,productValue:15,measurableSuccess:15,evidence:10,constraintsRisks:5,ideationScope:5};

// Structural validators do not verify stakeholder identity, business truth, or backend rights.
export function validateG1(record, targetPhase = "ideation") {
  member(targetPhase,Object.keys(phaseOrder),"targetPhase");
  if (record?.schemaVersion !== 2 || record.gate !== "G1") fail("G1 schemaVersion 2 required; legacy records need explicit review, not automatic promotion");
  for (const field of ["owner","problem","targetUser","outcome","productValue","successCriterion","reviewFramework","productionDestination","designSystem","confidence"]) text(record[field],"G1."+field);
  iso(record.timestamp,"G1.timestamp"); member(record.verdict,verdicts,"G1.verdict");
  if (!Number.isFinite(record.score) || record.score<0 || record.score>100) fail("G1.score must be 0..100");
  let total=0;
  for (const [key,weight] of Object.entries(weights)) {
    const rating=record.scoreBasis?.[key];
    if (!Number.isFinite(rating) || rating<0 || rating>5) fail("G1.scoreBasis."+key+" must be 0..5");
    if (essential.includes(key) && rating<2) fail("G1 essential dimension below 2/5: "+key);
    total += rating*weight/5;
  }
  if (Math.abs(total-record.score)>0.01) fail("G1 score does not match scoreBasis");
  if (record.score<60 || (record.verdict==="pass" && record.score<75)) fail("G1 score/verdict threshold mismatch");
  if (record.verdict==="conditional" && record.score>=75) fail("G1 conditional range is 60..74");
  nonempty(record.evidenceLabels,"G1.evidenceLabels");
  for (const label of record.evidenceLabels) member(label,["observed-user-behavior","operational-data","stakeholder-input","external-research","inference","assumption"],"evidence label");
  if (!Array.isArray(record.conditions)) fail("G1.conditions required");
  for (const condition of record.conditions) {
    member(condition.boundary,Object.keys(phaseOrder),"condition.boundary"); member(condition.disposition,["resolved","accepted-risk","blocked"],"condition.disposition"); text(condition.detail,"condition.detail");
    if (condition.disposition==="blocked" && phaseOrder[condition.boundary]<=phaseOrder[targetPhase]) fail("unresolved G1 blocker at "+condition.boundary);
  }
  if (record.verdict==="blocked") fail("G1 is blocked");
  return record;
}

export function selectIdeationMode({ scope="multi-step", materialRisk=false, regulatedCopy=false, journeyUncertainty=false, requestedMode }={}) {
  member(scope,["multi-step","single-screen"],"scope");
  for (const value of [materialRisk,regulatedCopy,journeyUncertainty]) if (typeof value!=="boolean") fail("risk flags must be boolean");
  if (requestedMode!==undefined) member(requestedMode,["lean","full-evidence"],"requestedMode");
  const requiresFull = scope==="multi-step" || materialRisk || regulatedCopy || journeyUncertainty;
  if (requestedMode==="lean" && requiresFull) fail("scope or risk requires full-evidence; do not silently downgrade a journey to landing anchors");
  return { scope, mode:requestedMode ?? (requiresFull ? "full-evidence" : "lean") };
}

function inspectSource(source) {
  text(source.id,"source.id"); absolute(source.path,"source.path"); digest(source.sha256,"source.sha256");
  if (source.provenance!=="generated-candidate") fail("candidate provenance must be generated-candidate, not a provided target");
  if (source.criticalCopyReadable!==true) fail("unreadable critical copy");
  const review=source.review;
  if (!review || review.inspectedPath!==source.path || review.inspectedSha256!==source.sha256) fail("review must bind exact source path and hash");
  text(review.reviewer,"review.reviewer"); iso(review.timestamp,"review.timestamp");
  member(review.composition,["accepted","changes-required"],"review.composition"); member(review.businessFidelity,["accepted","changes-required"],"review.businessFidelity");
  if (!Array.isArray(review.findings)) fail("review.findings required");
  for (const finding of review.findings) {
    text(finding.id,"finding.id"); member(finding.severity,["material","minor"],"finding.severity");
    member(finding.category,["business-data","action-state","permission","copy","composition","continuity"],"finding.category");
    text(finding.detail,"finding.detail"); text(finding.evidence,"finding.evidence"); member(finding.status,["open","resolved"],"finding.status");
  }
  const eligible=review.composition==="accepted" && review.businessFidelity==="accepted" && !review.findings.some(x=>x.status==="open");
  if (source.buildSourceEligible!==eligible) fail("buildSourceEligible conflicts with inspected findings");
  return source;
}
function uniqueSources(sources) {
  const ids=new Set(), hashes=new Set();
  for (const source of sources) { inspectSource(source); if(ids.has(source.id)||hashes.has(source.sha256)) fail("duplicate source id or hash"); ids.add(source.id); hashes.add(source.sha256); }
}

export function validateIdeationEvidence(evidence, manifest) {
  if (evidence?.schemaVersion!==2) fail("ideation evidence schemaVersion 2 required");
  validateIdeationManifest(manifest); digest(evidence.manifestFingerprint,"manifestFingerprint");
  if (evidence.manifestFingerprint!==manifestFingerprint(manifest)) fail("manifest fingerprint mismatch");
  if (evidence.evidenceMode!==manifest.evidenceMode) fail("evidence mode differs from frozen manifest");
  member(evidence.mode,["visual-and-copy","composition-only"],"copy mode");
  if (!Array.isArray(evidence.candidates)||evidence.candidates.length!==3) fail("exactly three comparable anchor candidates required");
  const expectedAnchors=manifest.variants.map(v=>v.anchorScreenId);
  if (canonicalJson(evidence.candidates.map(x=>x.id))!==canonicalJson(expectedAnchors)) fail("anchors must match ordered manifest screen IDs");
  if (!Array.isArray(evidence.screens)) fail("evidence.screens required");
  uniqueSources(evidence.screens);
  for (const candidate of evidence.candidates) {
    inspectSource(candidate); const source=evidence.screens.find(s=>s.id===candidate.id);
    if(!source || canonicalJson(source)!==canonicalJson(candidate)) fail("anchor must resolve to identical inspected screen record");
  }
  const planned=manifest.variants.flatMap(v=>v.screens.map(s=>s.id));
  if (evidence.screens.some(s=>!planned.includes(s.id))) fail("unplanned source screen");
  if (canonicalJson(evidence.screens.map(s=>s.id))!==canonicalJson(planned)) fail("comparison must contain every required screen in exact manifest order; anchors do not establish journey coverage");
  const isFullJourney=manifest.comparisonContract.scope==="multi-step" && evidence.evidenceMode==="full-evidence";
  if (evidence.fullJourneyCoverage!==isFullJourney) fail("fullJourneyCoverage must reflect scope and evidence mode, not a landing-only comparison");
  if (evidence.mode==="composition-only") { nonempty(evidence.copyManifest?.entries,"copyManifest.entries"); for(const x of evidence.copyManifest.entries){text(x.key,"copy key");text(x.exactText,"exact copy");} }
  return evidence;
}

// Explicit filesystem verification, separate from shape validation. Generated bytes must exist and match.
export function verifyLocalEvidenceFiles(sources, { root }={}) {
  absolute(root,"evidence root"); const realRoot=realpathSync(root);
  for(const source of sources){absolute(source.path,"source.path");digest(source.sha256,"source.sha256");
    const real=realpathSync(source.path); const relative=path.relative(realRoot,real);
    if(relative===".."||relative.startsWith(".."+path.sep)||path.isAbsolute(relative)) fail("evidence path escapes root, including symlinks");
    if(sha256(readFileSync(real))!==source.sha256) fail("file hash mismatch: "+source.id);
  } return sources;
}

const gateStates={G1:["validated"],G2:["direction-selected","journey-selected"],G3:["screen-set-approved"],G4:["approved-for-build"],G5:["QA-passed"],G6:["validated"],G7:["validated"]};
export function validateGateRecord(record,{expectedGate,evidenceHash}={}) {
  if(record?.schemaVersion!==2 || !gateStates[record.gate] || (expectedGate&&record.gate!==expectedGate)) fail("expected schemaVersion 2 gate record");
  member(record.status,gateStates[record.gate],"gate/status");member(record.verdict,verdicts,"gate verdict");
  for(const field of ["owner","scope"])text(record[field],"gate."+field);iso(record.timestamp,"gate.timestamp");absolute(record.evidencePath,"gate.evidencePath");digest(record.evidenceHash,"gate.evidenceHash");
  if(evidenceHash&&record.evidenceHash!==evidenceHash)fail("gate evidence hash diverges");
  if(!["pass","experiment"].includes(record.verdict))fail("gate is not ready for its named transition");
  if(record.gate==="G2"){
    member(record.evidenceMode,["lean","full-evidence"],"G2.evidenceMode");member(record.selectedVariant,["V1","V2","V3"],"G2.selectedVariant");digest(record.manifestFingerprint,"G2.manifestFingerprint");
    member(record.comparisonScope,["multi-step","single-screen"],"G2.comparisonScope");
    if(record.comparisonScope==="multi-step" && record.evidenceMode!=="full-evidence")fail("multi-step G2 requires full-evidence, never lean anchors");
    if(record.status!==(record.comparisonScope==="multi-step"?"journey-selected":"direction-selected"))fail("G2 status must match comparison scope");
    if(record.buildApproved!==false || record.screenSetApproved!==false || record.readyFor!=="selected-screen-production")fail("G2 only permits selected-screen-production, never build approval");
  }
  if(record.gate==="G3" && (record.readyFor!=="build-handoff"||record.screenSetApproved!==true||record.buildApproved!==false))fail("G3 is screen-set approval, not build command");
  if(record.gate==="G4" && (record.readyFor!=="prototype-build"||record.screenSetApproved!==true||record.buildApproved!==true))fail("G4 explicit prototype build approval required");
  return record;
}

export function validateDirectionSelection(record,evidence,manifest){
  validateGateRecord(record,{expectedGate:"G2",evidenceHash:sha256(evidence)});validateIdeationEvidence(evidence,manifest);
  if(record.manifestFingerprint!==evidence.manifestFingerprint||record.evidenceMode!==evidence.evidenceMode||record.comparisonScope!==manifest.comparisonContract.scope)fail("G2 comparison binding mismatch");
  const variant=manifest.variants.find(x=>x.id===record.selectedVariant),source=evidence.candidates.find(x=>x.id===variant.anchorScreenId);
  if(record.selectedAnchorPath!==source.path||record.selectedAnchorSha256!==source.sha256)fail("G2 selected anchor binding mismatch");
  if(record.verdict==="pass" && evidence.screens.some(s=>!s.buildSourceEligible))fail("comparison sources require correction; preserve choice as experiment, not source approval or journey pass");
  return record;
}

export function validateScreenSetEvidence(evidence,manifest,selection){
  validateIdeationManifest(manifest);validateGateRecord(selection,{expectedGate:"G2"});
  if(evidence?.schemaVersion!==2 || evidence.kind!=="selected-screen-set")fail("selected-screen-set schemaVersion 2 required");
  if(evidence.manifestFingerprint!==manifestFingerprint(manifest)||selection.manifestFingerprint!==evidence.manifestFingerprint||evidence.selectedVariant!==selection.selectedVariant||selection.comparisonScope!==manifest.comparisonContract.scope||selection.evidenceMode!==manifest.evidenceMode)fail("selected screen set binding mismatch");
  const planned=manifest.variants.find(v=>v.id===evidence.selectedVariant).screens.map(s=>s.id);
  if(canonicalJson(evidence.screens?.map(x=>x.id))!==canonicalJson(planned))fail("selected set must contain every required screen in order");
  uniqueSources(evidence.screens);if(evidence.screens.some(s=>s.buildSourceEligible!==true))fail("selected source is not build eligible");
  const approval=evidence.approval;if(approval?.screenSetApproved!==true)fail("explicit full screen-set approval required");text(approval.owner,"approval.owner");text(approval.statement,"approval.statement");iso(approval.timestamp,"approval.timestamp");
  if(approval.screenSetHash!==sha256(evidence.screens))fail("approval must bind exact ordered source versions");
  return evidence;
}

export async function advanceGateTransaction({evidence,gate,writeEvidence,writeGate,mirrorBeads,writeReadiness}){
  for(const cb of [writeEvidence,writeGate,mirrorBeads,writeReadiness])if(typeof cb!=="function")fail("all transition callbacks required");
  validateGateRecord(gate,{evidenceHash:sha256(evidence)});
  await writeEvidence(evidence);await writeGate(gate);await mirrorBeads({gate:gate.gate,status:gate.status,evidenceHash:gate.evidenceHash});
  await writeReadiness({gate:gate.gate,readyFor:gate.readyFor,status:gate.status,evidenceHash:gate.evidenceHash});
  return {gate:gate.gate,readyFor:gate.readyFor};
}

export function validateDesignContract(contract){
  if(contract?.schemaVersion!==1)fail("design contract schemaVersion 1 required");
  for(const field of ["problem","value","sharedOutcome","evidenceLevel"])text(contract.product?.[field],"product."+field);
  nonempty(contract.product.invariants,"product.invariants");nonempty(contract.personas,"personas");nonempty(contract.scenarios,"scenarios");
  const ids=new Set();for(const persona of contract.personas){text(persona.id,"persona.id");if(ids.has(persona.id))fail("duplicate persona");ids.add(persona.id);text(persona.responsibility,"persona.responsibility");}
  for(const scenario of contract.scenarios){if(!ids.has(scenario.personaId))fail("scenario references unknown persona");for(const field of ["trigger","start","end","successCriterion","directPath","conversationalPath","handoff","recovery"])text(scenario[field],"scenario."+field);nonempty(scenario.states,"scenario.states");}
  nonempty(contract.components,"components");
  for(const c of contract.components){for(const field of ["id","question","representation","source","scope","period","freshness","detailTarget","recovery"])text(c[field],"component."+field);nonempty(c.states,"component.states");
    member(c.dataKind,["metric","calendar","status","artifact"],"component.dataKind");member(c.action?.kind,["read","view","prepare","simulate","command"],"action.kind");text(c.action.effect,"action.effect");text(c.action.authorization,"action.authorization");
    if(["read","view","simulate"].includes(c.action.kind)&&c.action.effect!=="none")fail("read/view/simulation must not perform business effect");
    if(c.action.kind==="command"){text(c.action.reviewVersion,"command.reviewVersion");text(c.action.effectSummary,"command.effectSummary");if(c.action.explicitActivation!==true)fail("explicit command activation required");}
    if(c.dataKind==="metric"){for(const field of ["version","unit","population","deduplication","zeroVsUnavailable"])text(c.metric?.[field],"metric."+field);if(c.metric.sameScopeAtDetail!==true)fail("metric detail must preserve scope/version/period");}
  }
  for(const field of ["principalWorkspace","hierarchy","density","designSystem","viewportRationale"])text(contract.ui?.[field],"ui."+field);
  return contract;
}


// A separate experience blueprint links the method to concrete design decisions.
// Presence/coherence is not UX quality, stakeholder identity, mandate authority or pixel truth.
export function validateExperienceBlueprint(blueprint, designContract) {
  validateDesignContract(designContract);
  if (blueprint?.schemaVersion!==1) fail("experience blueprint schemaVersion 1 required");
  const labels=["observed-user-behavior","operational-data","stakeholder-input","external-research","inference","assumption"];
  const strings=(values,label,allowEmpty=false)=>{if(!Array.isArray(values)||(!allowEmpty&&!values.length)||values.some(v=>typeof v!=="string"||!v.trim()))fail(label+" must be a string array");};
  const keyed=(items,label,allowEmpty=false)=>{if(!Array.isArray(items)||(!allowEmpty&&!items.length))fail(label+" required");const out=new Map();for(const item of items){text(item?.id,label+".id");if(out.has(item.id))fail("duplicate "+label+" id");out.set(item.id,item);}return out;};
  const references=(values,index,label,allowEmpty=false)=>{strings(values,label,allowEmpty);if(new Set(values).size!==values.length)fail("duplicate "+label+" reference");for(const id of values)if(!index.has(id))fail(label+" references unknown id: "+id);};
  const inputs=keyed(blueprint.inputs,"inputs"),decisions=keyed(blueprint.decisions,"decisions"),questions=keyed(blueprint.questions,"questions"),states=keyed(blueprint.screenStates,"screenStates"),checks=keyed(blueprint.verifications,"verifications");
  const personas=new Map(designContract.personas.map(p=>[p.id,p]));
  const scenarios=keyed(designContract.scenarios,"design scenarios");
  for(const input of inputs.values()){text(input.detail,"input.detail");member(input.evidenceLabel,labels,"input.evidenceLabel");}
  for(const decision of decisions.values())for(const field of ["detail","productImpact","uxImpact","uiImpact"])text(decision[field],"decision."+field);
  for(const question of questions.values()){
    for(const field of ["theme","prompt","answer"])text(question[field],"question."+field);
    references(question.inputIds,inputs,"question.inputIds");references(question.decisionIds,decisions,"question.decisionIds");
    member(question.disposition,["answered","assumed","blocking"],"question.disposition");
    if(question.disposition==="blocking")fail("unresolved blocking design question: "+question.id);
  }
  const coveredPersonas=new Set();
  if(!Array.isArray(blueprint.userValues))fail("userValues required");
  for(const user of blueprint.userValues){
    if(!personas.has(user.personaId)||coveredPersonas.has(user.personaId))fail("userValues unknown or duplicate persona");coveredPersonas.add(user.personaId);
    for(const field of ["goal","currentAlternative","valueHypothesis","costOfFailure","successCriterion"])text(user[field],"userValue."+field);
    references(user.evidenceInputIds,inputs,"userValue.evidenceInputIds");
    if(!designContract.scenarios.some(s=>s.personaId===user.personaId))fail("covered persona needs an end-to-end scenario");
  }
  if(!Array.isArray(blueprint.deferredPersonas))fail("deferredPersonas required");
  for(const user of blueprint.deferredPersonas){if(!personas.has(user.personaId)||coveredPersonas.has(user.personaId))fail("deferred persona unknown or duplicate");coveredPersonas.add(user.personaId);text(user.rationale,"deferred persona rationale");}
  if(coveredPersonas.size!==personas.size)fail("every persona needs value coverage or explicit defer rationale");
  for(const state of states.values()){
    if(!scenarios.has(state.scenarioId))fail("screenState references unknown scenario");
    for(const field of ["screenId","state","question","information","primaryAction","resultEvidence","contextReturn"])text(state[field],"screenState."+field);
    references(state.decisionIds,decisions,"screenState.decisionIds");
  }
  for(const check of checks.values()){
    if(!scenarios.has(check.scenarioId))fail("verification references unknown scenario");text(check.criterion,"verification.criterion");
    member(check.evidenceLevel,["proposed","structural","source-review","agent-walkthrough","observed-user-behavior","operational-data"],"verification.evidenceLevel");
    references(check.screenStateIds,states,"verification.screenStateIds");
    if(check.screenStateIds.some(id=>states.get(id).scenarioId!==check.scenarioId))fail("verification scenario differs from inspected screen states");
  }
  const traced=new Set(),usedDecisions=new Set();
  if(!Array.isArray(blueprint.traceability))fail("traceability required");
  for(const row of blueprint.traceability){
    if(!inputs.has(row.inputId)||traced.has(row.inputId))fail("traceability unknown or duplicate input");traced.add(row.inputId);
    member(row.disposition,["addressed","deferred","out-of-scope"],"traceability.disposition");
    if(row.disposition!=="addressed"){text(row.rationale,"traceability rationale");continue;}
    references(row.decisionIds,decisions,"traceability.decisionIds");references(row.scenarioIds,scenarios,"traceability.scenarioIds");references(row.screenStateIds,states,"traceability.screenStateIds");references(row.verificationIds,checks,"traceability.verificationIds");
    for(const id of row.decisionIds)usedDecisions.add(id);
    for(const id of row.screenStateIds){const state=states.get(id);if(!row.scenarioIds.includes(state.scenarioId)||!row.decisionIds.some(d=>state.decisionIds.includes(d)))fail("traceability state must implement its linked decision and scenario");}
    for(const id of row.verificationIds){const check=checks.get(id);if(!row.scenarioIds.includes(check.scenarioId)||!check.screenStateIds.some(s=>row.screenStateIds.includes(s)))fail("traceability check must inspect a linked scenario and screen state");}
    if(![...questions.values()].some(q=>q.inputIds.includes(row.inputId)&&q.decisionIds.some(d=>row.decisionIds.includes(d))))fail("addressed input needs a question/answer linked to its decision");
  }
  if(traced.size!==inputs.size)fail("every input needs a traced design consequence or explicit defer");
  if(usedDecisions.size!==decisions.size)fail("every decision needs an addressed input trace");
  for(const feature of ["conversation","proactivity","presentations"])if(typeof blueprint.features?.[feature]!=="boolean")fail("features."+feature+" must be explicit boolean");
  const intents=keyed(blueprint.intents,"intents",!blueprint.features.conversation);
  for(const intent of intents.values()){
    if(!scenarios.has(intent.scenarioId)||scenarios.get(intent.scenarioId).personaId!==intent.personaId)fail("intent scenario/persona mismatch");
    member(intent.kind,["explain","filter","compare","prepare","review","command","track"],"intent.kind");
    for(const field of ["location","directPath","contextReturn","manualEditsPolicy","lateResultPolicy"])text(intent[field],"intent."+field);
    member(intent.actionKind,["read","view","prepare","simulate","command"],"intent.actionKind");
    if(["explain","filter","compare","track"].includes(intent.kind)&&(!["read","view","simulate"].includes(intent.actionKind)||intent.effect!=="none"))fail("read/filter/compare/track intention cannot trigger a business effect");
    if(intent.kind==="prepare"&&intent.actionKind!=="prepare")fail("prepare intent must represent internal preparation");
    if(intent.kind==="command"&&intent.actionKind!=="command")fail("command intent must represent an authorized command");
    if(["read","view","simulate"].includes(intent.actionKind)&&intent.effect!=="none")fail("view intention has no business effect");
    if(intent.actionKind==="prepare"&&intent.effect!=="internal")fail("preparation is internal, not external send");
    if(intent.actionKind==="command"){text(intent.authority,"intent.authority");text(intent.reviewVersion,"intent.reviewVersion");text(intent.effectSummary,"intent.effectSummary");if(intent.explicitActivation!==true)fail("intent command needs explicit activation");member(intent.effect,["internal","external"],"intent command effect");}
  }
  if(blueprint.features.conversation){
    const c=blueprint.conversation;
    if(typeof c?.continuousAccessRequested!=="boolean"||typeof c.permanentTranscriptSidebar!=="boolean"||c.directControlsAvailable!==true)fail("conversation request and direct controls must be explicit");
    if(c.continuousAccessRequested&&(c.accessible!==true||c.permanentTranscriptSidebar!==false))fail("requested continuous conversation must be accessible without permanent transcript sidebar");
    strings(c.stableContext,"conversation.stableContext");for(const key of ["navigation","scope","period","filters","object","origin","return"])if(!c.stableContext.includes(key))fail("conversation loses stable context: "+key);
    for(const field of ["focusAndSpace","manualEditsPolicy","lateResultPolicy","revokedRecovery"])text(c[field],"conversation."+field);
  }
  if(blueprint.features.proactivity){
    const p=blueprint.proactivity;if(!Array.isArray(p?.triggerReview)||p.triggerReview.length!==2)fail("proactivity must review opportunity and exception");
    const triggerKinds=new Set();for(const review of p.triggerReview){member(review.kind,["opportunity","exception"],"trigger.kind");if(triggerKinds.has(review.kind))fail("duplicate trigger review");triggerKinds.add(review.kind);member(review.disposition,["in-scope","deferred","not-applicable"],"trigger.disposition");text(review.rationale,"trigger.rationale");}
    const initiatives=keyed(p.initiatives,"initiatives",true);
    for(const initiative of initiatives.values()){
      member(initiative.triggerKind,["opportunity","exception"],"initiative.triggerKind");
      if(!p.triggerReview.some(r=>r.kind===initiative.triggerKind&&r.disposition==="in-scope"))fail("initiative contradicts trigger scope review");
      if(!inputs.has(initiative.sourceInputId)||!scenarios.has(initiative.scenarioId)||scenarios.get(initiative.scenarioId).personaId!==initiative.personaId)fail("initiative source/scenario/persona mismatch");
      for(const field of ["whyNow","leadTime","value","preparedWork","eligibleExecution","unknownEffectRecovery"])text(initiative[field],"initiative."+field);
      member(initiative.timing?.status,["known","estimated","unknown"],"initiative.timing.status");text(initiative.timing.label,"initiative.timing.label");
      for(const field of ["scope","authority","limits","owner","stopCondition"])text(initiative.mandate?.[field],"mandate."+field);
      for(const field of ["location","dismiss","defer"])text(initiative.attention?.[field],"attention."+field);member(initiative.attention.interruption,["grouped-context","decision-needed","background-only"],"attention.interruption");
    }
    for(const review of p.triggerReview)if(review.disposition==="in-scope"&&![...initiatives.values()].some(i=>i.triggerKind===review.kind))fail("in-scope trigger needs useful prepared/eligible work, not generic alerts");
  }
  const artifacts=keyed(blueprint.artifacts,"artifacts",!blueprint.features.presentations);
  for(const artifact of artifacts.values()){
    if(!scenarios.has(artifact.scenarioId))fail("artifact references unknown scenario");
    for(const field of ["audience","purpose","snapshot","review","version","exportEffect","deliveryAuthorization"])text(artifact[field],"artifact."+field);
    if(artifact.contentFormat!=="native-editable")fail("artifact needs native editable content, not text baked into PNG");
    references(artifact.corpusInputIds,inputs,"artifact.corpusInputIds");nonempty(artifact.claimSources,"artifact.claimSources");
    for(const claim of artifact.claimSources){text(claim.claim,"artifact claim");references(claim.inputIds,inputs,"claim.inputIds");if(claim.inputIds.some(id=>!artifact.corpusInputIds.includes(id)))fail("artifact claim must reference its frozen corpus");}
    for(const field of ["application","organization","client"])text(artifact.brand?.[field],"brand."+field);
    if(typeof artifact.brand.officialTemplateProvided!=="boolean"||typeof artifact.brand.conformityClaim!=="boolean")fail("brand template/conformity must be explicit booleans");
    if(artifact.brand.conformityClaim&&!artifact.brand.officialTemplateProvided)fail("no official brand conformity claim without template evidence");
  }
  return blueprint;
}

const pathEvidence = (value,label) => {text(value,label); if (!value.startsWith("/") && !/^https?:/.test(value)) fail(label+" must be path or URL");};
export function validateDesignQaReport(report) {
  if (report?.schemaVersion !== 1) fail("design QA schemaVersion must equal 1");
  if (!Array.isArray(report.states) || !report.states.length) fail("design QA requires a state matrix");
  for (const [i, state] of report.states.entries()) {
    for (const field of ["id", "route", "state", "sourcePath", "renderedPath", "combinedComparisonPath"]) text(state[field], `states[${i}].${field}`);
    pathEvidence(state.sourcePath, `states[${i}].sourcePath`); pathEvidence(state.renderedPath, `states[${i}].renderedPath`); pathEvidence(state.combinedComparisonPath, `states[${i}].combinedComparisonPath`);
    if (!Number.isInteger(state.viewport?.width) || !Number.isInteger(state.viewport?.height)) fail(`states[${i}].viewport is required`);
    for (const surface of ["typography", "spacing", "colors", "images", "copy"]) text(state.surfaces?.[surface], `states[${i}].surfaces.${surface}`);
    const consoleCheck = state.console;
    if (!consoleCheck || !Array.isArray(consoleCheck.errors)) fail(`states[${i}].console errors array is required`);
    const availability = consoleCheck.availability === undefined ? "available" : consoleCheck.availability; // Legacy checked records remain supported.
    member(availability, ["available", "unavailable"], `states[${i}].console.availability`);
    if (availability === "available" && consoleCheck.checked !== true) fail(`states[${i}].console check is required when available`);
    if (availability === "unavailable") {
      if (consoleCheck.checked !== false) fail(`states[${i}].console cannot be checked when unavailable`);
      text(consoleCheck.reason, `states[${i}].console unavailability reason`);
    }
    if (consoleCheck.errors.length) fail(`states[${i}] has reproducible runtime console errors`);
  }
  if (!Array.isArray(report.history)) fail("design QA comparison history is required");
  for (const [i, item] of report.history.entries()) { if (!["P0", "P1", "P2"].includes(item.severity)) fail(`history[${i}].severity is invalid`); for (const field of ["finding", "fix", "beforePath", "afterPath"]) text(item[field], `history[${i}].${field}`); }
  if (report.openP0P1P2 !== 0) fail("actionable P0/P1/P2 remain");
  if (report.g5?.execution !== "pass" || report.g5?.productTestValidity !== "pass") fail("both G5 gates must pass");
  if (report.finalResult !== "passed") fail("design QA finalResult must be passed");
  return report;
}

export function validateAnnotationReceipt(receipt) {
  if (receipt?.schemaVersion !== 1) fail("annotation receipt schemaVersion must equal 1");
  for (const field of ["projectRoot", "route", "timestamp"]) text(receipt[field], `annotation.${field}`);
  if (!Number.isInteger(receipt.viewport?.width) || !Number.isInteger(receipt.viewport?.height)) fail("annotation viewport is required");
  for (const field of ["overlay", "post", "inboxWrite", "productionGuard"]) if (receipt.transport?.[field] !== true) fail(`annotation transport.${field} was not verified`);
  if (typeof receipt.editCycleTested !== "boolean") fail("annotation editCycleTested boolean is required");
  if (receipt.editCycleTested) for (const field of ["beforeCapture", "mapping", "edit", "afterCapture", "processedRecord", "qaResult"]) text(receipt.editCycle?.[field], `annotation.editCycle.${field}`);
  return receipt;
}

export function validateArtifactIndex(index) {
  if (index?.schemaVersion !== 1 || !Array.isArray(index.artifacts) || !index.artifacts.length) fail("artifact index is required");
  const canonical = new Map();
  for (const item of index.artifacts) {
    for (const field of ["id", "path", "purpose", "status", "sha256", "sourceManifest"]) text(item[field], `artifact.${field}`);
    if (!["accepted", "rejected", "history"].includes(item.status)) fail("artifact status is invalid");
    if (typeof item.canonical !== "boolean") fail("artifact canonical flag is required");
    if (item.canonical && item.status !== "accepted") fail("only accepted artifacts may be canonical");
    if (item.canonical && canonical.has(item.purpose)) fail(`multiple canonical artifacts for ${item.purpose}`);
    if (item.canonical) canonical.set(item.purpose, item.id);
    if (!item.canonical && item.status === "accepted") text(item.supersededBy, `artifact.${item.id}.supersededBy`);
  }
  return { ...index, resolve(purpose) { const id = canonical.get(purpose); if (!id) fail(`no canonical artifact for ${purpose}`); return index.artifacts.find((item) => item.id === id); } };
}

export function validateBuildHandoff(handoff) {
  if (handoff?.schemaVersion !== 1 || handoff.gate !== "G4") fail("G4 build handoff schemaVersion 1 is required");
  for (const field of ["canonicalRoot", "targetType", "scaffoldProvenance", "dependencyReadiness", "designSystem", "designSystemVersion", "productPath", "frameworkPath", "owner", "timestamp", "evidenceHash"]) text(handoff[field], `handoff.${field}`);
  pathEvidence(handoff.canonicalRoot, "handoff.canonicalRoot");
  if (!Array.isArray(handoff.gates) || !["G1", "G2", "G3"].every((gate) => handoff.gates.some((item) => item.gate === gate && item.status === "pass"))) fail("G1/G2/G3 must pass before G4 handoff");
  if (handoff.targetType === "durable-servier" && (handoff.designSystem.toLowerCase() === "none" || handoff.dependencyReadiness !== "ready")) fail("durable Servier handoff requires a ready, versioned design system");
  return handoff;
}

export function assertBeadsClosure({gate,bead}) { validateGateRecord(gate); if(bead?.gate!==gate.gate || bead?.status!==gate.status || bead?.evidenceHash!==gate.evidenceHash) fail("Beads state diverges from gate"); return true; }
