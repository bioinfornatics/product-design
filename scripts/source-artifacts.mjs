import { readFileSync, realpathSync, lstatSync, existsSync } from "node:fs";
import path from "node:path";
import { sha256, validateExperienceBlueprint } from "./workflow-evidence-contract.mjs";

const fail = message => { throw new Error(message); };
const text = (v, label) => { if (typeof v !== "string" || !v.trim()) fail(label + " required"); };
const hash = (v, label) => { if (!/^[a-f0-9]{64}$/.test(v)) fail(label + " SHA-256 required"); };
const identifier = (v, label, lower = false) => { if (typeof v !== "string" || !(lower ? /^[a-z0-9]+(?:-[a-z0-9]+)*$/ : /^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/).test(v) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(v)) fail(label + " safe identifier required"); };
const unique = (values, label, allowEmpty = false) => { if (!Array.isArray(values) || (!allowEmpty && !values.length) || values.some(v => typeof v !== "string" || !v) || new Set(values).size !== values.length) fail(label + " unique ID array required"); };
const relative = (v, label) => { text(v,label); if (path.posix.isAbsolute(v) || path.win32.isAbsolute(v) || /[\\<>:"|?*\x00-\x1f\x7f]/.test(v) || v.split("/").some(p => !p || p === "." || p === ".." || /[. ]$/.test(p) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p))) fail(label + " safe project-relative path required"); };
const confined = (root, p) => { const r = path.relative(root,p); if (r === ".." || r.startsWith(".." + path.sep) || path.isAbsolute(r)) fail("source path escapes project"); return p; };
function local(project, rel, required = true) {
  relative(rel, "local path"); const root = realpathSync(path.resolve(project)), target = confined(root,path.resolve(root,rel));
  let cursor = root;
  for (const component of rel.split("/")) {
    cursor = path.join(cursor,component);
    try { const st = lstatSync(cursor); if (st.isSymbolicLink()) fail("source paths cannot contain symlinks"); confined(root,realpathSync(cursor)); }
    catch (error) { if (error.code !== "ENOENT") throw error; if (required) throw error; }
  }
  if (required && !lstatSync(target).isFile()) fail("source dependency must be a regular file");
  return target;
}
function dependency(ref, project) { const p = local(project,ref.path); const actual = sha256(readFileSync(p)); if(actual !== ref.sha256) fail("source dependency changed: " + ref.path); return p; }
function keyed(list, label) { if (!Array.isArray(list)) fail(label + " array required"); const result = new Map(); for(const v of list){text(v.id,label+".id");if(result.has(v.id))fail("duplicate "+label+" id");result.set(v.id,v);} return result; }
const linkFields = ["specificationIds","scenarioIds","decisionIds","screenStateIds","verificationIds"];
export function validateSourcePlan(plan) {
  if(plan?.schemaVersion !== 1 || plan.kind !== "product-design-source-plan") fail("product-design-source-plan schemaVersion 1 required");
  identifier(plan.journeyId,"journeyId",true); identifier(plan.sessionId,"sessionId",true);
  if(typeof plan.involved !== "boolean")fail("involved boolean required");
  const specs = keyed(plan.specificationSources,"specificationSources"); if(!specs.size)fail("actual specificationSources required");
  for(const s of specs.values()){relative(s.path,"specification path");hash(s.sha256,"specification hash");text(s.revision,"specification revision");if(!["current","historical"].includes(s.authority))fail("specification authority required");}
  if(plan.involved){for(const key of ["designContract","blueprint"]){relative(plan.context?.[key]?.path,"context."+key+".path");hash(plan.context[key].sha256,"context."+key+".sha256");}}
  const screens = keyed(plan.screens,"screens"); if(!screens.size)fail("planned sources required");
  for(const s of screens.values()){
    identifier(s.id,"screen.id");identifier(s.variantId,"variantId");text(s.purpose,"screen.purpose");
    if(!["main-path","outcome","critical-recovery","optional","isolated"].includes(s.role))fail("screen role unsupported");
    if(!Number.isInteger(s.attemptLimit) || s.attemptLimit < 1)fail("positive attemptLimit required");
    if(!["End","ReturnToOrigin","ProtectedExit"].includes(s.nextScreen) && (!screens.has(s.nextScreen) || screens.get(s.nextScreen).variantId !== s.variantId))fail("nextScreen must resolve within the variant or an explicit terminal/return");
    for(const field of linkFields)unique(s.links?.[field],"links."+field,!plan.involved && field !== "specificationIds");
    if(s.links.specificationIds.some(id => !specs.has(id)))fail("unknown specification link");
  }
  return plan;
}
export function verifySourcePlanFiles(plan,{project}) {
  validateSourcePlan(plan); const files = plan.specificationSources.map(s => ({path:dependency(s,project),sha256:s.sha256}));
  if(plan.involved){
    const cp=dependency(plan.context.designContract,project), bp=dependency(plan.context.blueprint,project); files.push({path:cp,sha256:plan.context.designContract.sha256},{path:bp,sha256:plan.context.blueprint.sha256});
    const contract=JSON.parse(readFileSync(cp)),blueprint=JSON.parse(readFileSync(bp));validateExperienceBlueprint(blueprint,contract);
    const scenarios=keyed(contract.scenarios,"scenarios"),decisions=keyed(blueprint.decisions,"decisions"),states=keyed(blueprint.screenStates,"screenStates"),checks=keyed(blueprint.verifications,"verifications");
    for(const s of plan.screens){const l=s.links;
      for(const [field,byId] of [["scenarioIds",scenarios],["decisionIds",decisions],["screenStateIds",states],["verificationIds",checks]])if(l[field].some(id=>!byId.has(id)))fail("unknown "+field+" on "+s.id);
      for(const id of l.screenStateIds){const st=states.get(id);if(st.screenId !== s.id || !l.scenarioIds.includes(st.scenarioId) || !st.decisionIds.some(d=>l.decisionIds.includes(d)))fail("screen links do not implement their decision/scenario: "+s.id);}
      for(const id of l.verificationIds){const check=checks.get(id);if(!l.scenarioIds.includes(check.scenarioId)||!check.screenStateIds.some(st=>l.screenStateIds.includes(st)))fail("verification does not inspect linked screen state: "+s.id);}
    }
  }
  return files;
}
export function sourceDestination(plan,screenId,attempt,{project}) {
  validateSourcePlan(plan);const screen=plan.screens.find(s=>s.id===screenId);if(!screen)fail("unplanned source ID");
  if(!Number.isInteger(attempt)||attempt<1||attempt>screen.attemptLimit)fail("attempt limit exhausted or invalid");
  const workspace_output_path=["product-design",plan.journeyId,plan.sessionId,screen.variantId,screen.id+"-attempt-"+attempt+".png"].join("/");
  const expectedPath=local(project,"generated/"+workspace_output_path,false);
  return {workspace_output_path,save_to_workspace:true,n:1,expectedPath};
}
export function sourceImpact(plan,{project}) {
  validateSourcePlan(plan);const changes=[];
  for(const ref of [...plan.specificationSources,...(plan.involved?Object.entries(plan.context).map(([id,s])=>({...s,id,context:true})):[])]){
    let actual=null,reason;try{actual=sha256(readFileSync(local(project,ref.path)));}catch(error){reason=error.message;}
    if(actual!==ref.sha256)changes.push({id:ref.id,path:ref.path,expectedSha256:ref.sha256,actualSha256:actual,reason:reason??"dependency bytes changed",screenIds:plan.screens.filter(s=>ref.context||s.links.specificationIds.includes(ref.id)).map(s=>s.id)});
  }
  return {status:changes.length?"review-required":"unchanged",changes,affectedScreenIds:[...new Set(changes.flatMap(c=>c.screenIds))],authorization:"No source or approval is renewed by this report"};
}
function schemaProperties(schema) {
  const document=schema?.inputSchema??schema;
  if(document?.type !== "object" || !document.properties)fail("actual tool JSON input schema required");
  return document.properties;
}
function validateLedgerShape(plan,ledger){if(ledger?.schemaVersion!==1||ledger.kind!=="product-design-source-ledger"||ledger.sourcePlanHash!==sha256(plan)||!Array.isArray(ledger.records))fail("source ledger must bind the frozen plan");const seen=new Set();for(const r of ledger.records){const key=r.screenId+":"+r.attempt;if(seen.has(key))fail("duplicate source attempt");seen.add(key);}return ledger;}
export function verifySourceRecord(plan,record,{project}) {
  const d=sourceDestination(plan,record.screenId,record.attempt,{project}),screen=plan.screens.find(s=>s.id===record.screenId);
  if(record.variantId!==screen.variantId||record.sourcePlanHash!==sha256(plan)||record.path!==d.expectedPath)fail("source record identity/destination mismatch");
  hash(record.sha256,"source hash");const file=local(project,"generated/"+d.workspace_output_path);if(sha256(readFileSync(file))!==record.sha256)fail("source bytes changed");
  const review=record.review;if(review?.inspectedSha256!==record.sha256||review.inspectedPath!==record.path)fail("review must bind the actual canonical source bytes");text(review.reviewer,"reviewer");text(review.timestamp,"review timestamp");if(!Number.isFinite(Date.parse(review.timestamp)))fail("review timestamp invalid");
  if(!Array.isArray(review.findings)||!["accepted","changes-required"].includes(review.composition)||!["accepted","changes-required"].includes(review.businessFidelity))fail("explicit review findings/verdicts required");
  if(record.verdict!=="accepted"&&record.verdict!=="changes-required")fail("source verdict required");
  if(record.verdict==="accepted"&&(review.composition!=="accepted"||review.businessFidelity!=="accepted"||review.findings.some(f=>f.status!=="resolved")))fail("open source findings cannot be accepted");
  if(record.provenance?.kind!=="tool-output"||record.provenance.returnedPath!==record.path||record.provenance.workspace_output_path!==d.workspace_output_path)fail("canonical source requires exact tool output provenance; migration is separate");
  text(record.provenance.toolName,"tool provenance");hash(record.provenance.promptSha256,"prompt provenance");if(!Array.isArray(record.provenance.references))fail("reference provenance required");
  if(!record.timing||(!Number.isFinite(record.timing.endToEndMs)&&!record.timing.unavailableReason))fail("timing or unavailability reason required");
  if(record.userApproved!==false||record.runtimeVerified!==false)fail("source inspection cannot manufacture approval/runtime evidence");return record;
}
export function verifySourceLedger(plan,ledger,{project}) {
  validateLedgerShape(plan,ledger);const histories=new Map();
  for(const record of ledger.records){
    verifySourceRecord(plan,record,{project});const history=histories.get(record.screenId)??[];
    if(record.attempt!==history.length+1)fail("source ledger attempts must be contiguous and ordered per screen");
    if(history.some(r=>r.verdict==="accepted"))fail("source ledger cannot append an attempt after acceptance");
    history.push(record);histories.set(record.screenId,history);
  }
  return ledger;
}
export function prepareSourceAttempt({project,plan,screenId,attempt,toolSchema,toolName,ledger}) {
  verifySourcePlanFiles(plan,{project});if(!["imageGenerate","imageEdit","image_generate","image_edit"].includes(toolName))fail("generation/edit tool name required");
  const properties=schemaProperties(toolSchema);if(properties.workspace_output_path?.type!=="string"||properties.save_to_workspace?.type!=="boolean")fail("tool lacks explicit workspace_output_path/save_to_workspace capability");
  const d=sourceDestination(plan,screenId,attempt,{project});if(existsSync(d.expectedPath))fail("occupied canonical source destination");
  if(!ledger)fail("explicit source ledger required");verifySourceLedger(plan,ledger,{project});
  const records=ledger.records.filter(r=>r.screenId===screenId);if(records.some(r=>r.verdict==="accepted"))fail("reuse accepted source; do not regenerate on resume");
  if(attempt!==records.length+1)fail("attempt must follow persisted accepted/rejected attempts");return d;
}
/** Callback wrapper verifies bytes and persists rejected sources as well as accepted ones. */
export async function executeSourceAttempt({project,plan,screenId,attempt,toolSchema,toolName,ledger,generate,inspect,persist}) {
  if([generate,inspect,persist].some(f=>typeof f!=="function"))fail("generate, inspect and persist callbacks required");
  const prepared=prepareSourceAttempt({project,plan,screenId,attempt,toolSchema,toolName,ledger}),screen=plan.screens.find(s=>s.id===screenId),started=Date.now();
  const result=await generate({...prepared,screen});
  // Never substitute a copied file or infer a returned filename.
  if(result?.path!==prepared.expectedPath)fail("tool returned a different source destination");
  const p=local(project,"generated/"+prepared.workspace_output_path),digest=sha256(readFileSync(p));
  const review=await inspect({screen,returnedPath:p,sha256:digest});
  const record={screenId,variantId:screen.variantId,attempt,sourcePlanHash:sha256(plan),path:p,sha256:digest,verdict:review?.composition==="accepted"&&review?.businessFidelity==="accepted"&&!review?.findings?.some(f=>f.status!=="resolved")?"accepted":"changes-required",review,provenance:{kind:"tool-output",toolName,returnedPath:result.path,workspace_output_path:prepared.workspace_output_path,promptSha256:result.promptSha256,references:result.references??[]},timing:result.timing??{endToEndMs:Date.now()-started,providerMs:null,unavailableReason:"Provider timing unavailable"},userApproved:false,runtimeVerified:false};
  verifySourceRecord(plan,record,{project});const next={...ledger,records:[...ledger.records,record]};await persist(next);return {record,ledger:next};
}
