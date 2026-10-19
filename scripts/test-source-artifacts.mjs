import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { sha256 } from "./workflow-evidence-contract.mjs";
import { fixture as transitionFixture } from "../tests/fixtures/transition-evidence.mjs";
import { experienceFixture } from "../tests/fixtures/experience-blueprint.mjs";
import { checkTransition } from "./check-workflow-evidence.mjs";
import { validateSourcePlan, verifySourcePlanFiles, sourceDestination, prepareSourceAttempt, executeSourceAttempt, verifySourceLedger, verifySourceRecord, sourceImpact } from "./source-artifacts.mjs";
const schema={type:"object",properties:{workspace_output_path:{type:"string"},save_to_workspace:{type:"boolean"}}};
function fixture(involved=true){
 const root=mkdtempSync(path.join(tmpdir(),"pd-sources-"));const json=(rel,value)=>{const p=path.join(root,rel);mkdirSync(path.dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(value));return p;};
 const spec=json("specifications/product.json",{requirement:"No send during viewing"});const exp=experienceFixture();json("contract.json",exp.designContract);json("blueprint.json",exp.blueprint);
 const plan={schemaVersion:1,kind:"product-design-source-plan",journeyId:"commitments",sessionId:"selected-review",involved,specificationSources:[{id:"SPEC",path:"specifications/product.json",sha256:sha256(readFileSync(spec)),revision:"1",authority:"current"}],context:{designContract:{path:"contract.json",sha256:sha256(readFileSync(path.join(root,"contract.json")))},blueprint:{path:"blueprint.json",sha256:sha256(readFileSync(path.join(root,"blueprint.json")))}},screens:exp.blueprint.screenStates.map((s,i)=>({id:s.screenId,variantId:"V3",purpose:s.question,role:i===0?"main-path":"outcome",nextScreen:i===0?"V3-S2":"End",attemptLimit:2,links:{specificationIds:["SPEC"],scenarioIds:[s.scenarioId],decisionIds:s.decisionIds,screenStateIds:[s.id],verificationIds:["T"+(i+1)]}}))};
 const ledger={schemaVersion:1,kind:"product-design-source-ledger",sourcePlanHash:sha256(plan),records:[]};
 const args={project:root,plan,screenId:"V3-S1",attempt:1,toolSchema:schema,toolName:"imageEdit",ledger};
 const close=()=>rmSync(root,{recursive:true,force:true});return {root,json,plan,ledger,args,close};
}
async function using(fn,involved){const f=fixture(involved);try{await fn(f);}finally{f.close();}}
async function produce(f,args=f.args,accepted=true){return executeSourceAttempt({...args,generate:async({expectedPath})=>{mkdirSync(path.dirname(expectedPath),{recursive:true});writeFileSync(expectedPath,Buffer.from("synthetic image "+args.screenId+args.attempt));return {path:expectedPath,promptSha256:sha256("exact prompt"),references:[]};},inspect:async({returnedPath,sha256})=>({inspectedPath:returnedPath,inspectedSha256:sha256,reviewer:"synthetic-test",timestamp:"2026-10-19T10:00:00Z",composition:accepted?"accepted":"changes-required",businessFidelity:accepted?"accepted":"changes-required",findings:accepted?[]:[{id:"F",status:"open",detail:"Wrong copy"}]}),persist:async l=>{f.persisted=l;}});}

test("project relative plan becomes generated-relative MCP path once, edit and generate",async()=>using(async f=>{
 assert.equal(verifySourcePlanFiles(f.plan,{project:f.root}).length,3);
 for(const toolName of ["imageGenerate","imageEdit"]){const p=prepareSourceAttempt({...f.args,toolName});assert.equal(p.workspace_output_path,"product-design/commitments/selected-review/V3/V3-S1-attempt-1.png");assert.equal(p.expectedPath,path.join(f.root,"generated",p.workspace_output_path));assert.equal(p.n,1);}
}));
test("selected-only IDs, recovery and optional branches are not renumbered or alternatives",async()=>using(async f=>{
 f.plan.screens.push({...structuredClone(f.plan.screens[0]),id:"V3-R4",role:"critical-recovery",nextScreen:"ProtectedExit"});assert.doesNotThrow(()=>validateSourcePlan(f.plan));assert.match(sourceDestination(f.plan,"V3-R4",2,{project:f.root}).expectedPath,/V3-R4-attempt-2.png$/);
}));
test("source path, IDs, limits and links reject mechanically unsafe plans",async t=>{
 const mutations={doubleRelative:p=>p.specificationSources[0].path="../spec.json",windows:p=>p.specificationSources[0].path="C:\spec.json",id:p=>p.screens[0].id="../img",session:p=>p.sessionId="generated/review",limit:p=>p.screens[0].attemptLimit=0,missingSpec:p=>p.screens[0].links.specificationIds=["missing"],missingDecision:p=>p.screens[0].links.decisionIds=[],unknownState:p=>p.screens[0].links.screenStateIds=["wrong"],crossState:p=>p.screens[0].links.screenStateIds=["SS2"],wrongCheck:p=>p.screens[0].links.verificationIds=["T2"],unknownNext:p=>p.screens[0].nextScreen="outside"};
 for(const [name,mutate] of Object.entries(mutations))await t.test(name,()=>using(f=>{mutate(f.plan);assert.throws(()=>verifySourcePlanFiles(f.plan,{project:f.root}));}));
});
test("capability/schema mismatch stops before generate callback",async t=>{for(const toolSchema of [{},{type:"object",properties:{save_to_workspace:{type:"boolean"}}},{type:"object",properties:{workspace_output_path:{type:"string"},save_to_workspace:{type:"string"}}}])await t.test(JSON.stringify(toolSchema),()=>using(async f=>{let called=false;await assert.rejects(()=>executeSourceAttempt({...f.args,toolSchema,generate:async()=>{called=true;},inspect:async()=>{},persist:async()=>{}}),/schema|capability/);assert.equal(called,false);}));});
test("changed specification and context block and identify affected screen IDs",async()=>using(f=>{
 writeFileSync(path.join(f.root,"specifications/product.json"),"changed");assert.throws(()=>prepareSourceAttempt(f.args),/dependency changed/);const impact=sourceImpact(f.plan,{project:f.root});assert.equal(impact.status,"review-required");assert.deepEqual(impact.affectedScreenIds,["V3-S1","V3-S2"]);
}));
test("symlink inputs and output ancestors are refused",async()=>using(f=>{
 mkdirSync(path.join(f.root,"generated"));symlinkSync(f.root,path.join(f.root,"generated/product-design"),"dir");assert.throws(()=>sourceDestination(f.plan,"V3-S1",1,{project:f.root}),/symlink/);
}));
test("execute persists exact inspected output and reuse does not regenerate",async()=>using(async f=>{
 const {record,ledger}=await produce(f);assert.equal(record.verdict,"accepted");assert.equal(f.persisted.records.length,1);verifySourceLedger(f.plan,ledger,{project:f.root});
 assert.throws(()=>prepareSourceAttempt({...f.args,attempt:2,ledger}),/reuse accepted/);
 assert.throws(()=>prepareSourceAttempt(f.args),/occupied/);
 const changed={...record,provenance:{...record.provenance,kind:"historical-migration"}};assert.throws(()=>verifySourceRecord(f.plan,changed,{project:f.root}),/provenance/);
 writeFileSync(record.path,"modified");assert.throws(()=>verifySourceLedger(f.plan,ledger,{project:f.root}),/bytes changed/);
}));
test("rejected attempt is retained and next attempt is bounded and contiguous",async()=>using(async f=>{
 const first=await produce(f,f.args,false);assert.equal(first.record.verdict,"changes-required");assert.throws(()=>prepareSourceAttempt({...f.args,attempt:2,ledger:f.ledger}),/follow persisted/);
 const second=await produce(f,{...f.args,attempt:2,ledger:first.ledger},false);assert.equal(second.ledger.records.length,2);assert.throws(()=>prepareSourceAttempt({...f.args,attempt:3,ledger:second.ledger}),/limit/);
 assert.throws(()=>verifySourceLedger(f.plan,{...first.ledger,records:[first.record,first.record]},{project:f.root}),/duplicate/);
}));
test("wrong returned path or wrong review cannot be silently imported",async()=>using(async f=>{
 let writes=0;await assert.rejects(()=>executeSourceAttempt({...f.args,generate:async()=>({path:"/tmp/random.png"}),inspect:async()=>{},persist:async()=>writes++}),/different source destination/);assert.equal(writes,0);
 const d=sourceDestination(f.plan,"V3-S1",1,{project:f.root});mkdirSync(path.dirname(d.expectedPath),{recursive:true});writeFileSync(d.expectedPath,"already there");assert.throws(()=>prepareSourceAttempt(f.args),/occupied/);
}));
test("source plan is part of gate freshness and missing ledgers cannot approve source sets",async()=>using(async f=>{
 f.json("source-plan.json",f.plan);const request={schemaVersion:1,operation:"brief-to-ideation",workflow:"generated",involved:false,scope:"bounded",target:"task",outcome:"result",owner:"fixture",timestamp:"2026-10-19T10:00:00Z",sourcePlan:"source-plan.json"};f.json("request.json",request);
 const first=await checkTransition({project:f.root,requestPath:"request.json"});assert.equal(first.status,"passed",first.reason);assert.equal((await checkTransition({project:f.root,requestPath:"request.json",consume:true})).status,"passed");
 writeFileSync(path.join(f.root,"specifications/product.json"),"changed");const changed=await checkTransition({project:f.root,requestPath:"request.json",consume:true});assert.equal(changed.status,"blocked");assert.match(changed.reason,/dependency changed/);
}));
test("CLI has deterministic offline exit status and does not call providers",async()=>using(f=>{
 f.json("source-plan.json",f.plan);f.json("ledger.json",f.ledger);f.json("tool-schema.json",schema);const cli=fileURLToPath(new URL("./check-source-artifacts.mjs",import.meta.url));
 const run=extra=>spawnSync(process.execPath,[cli,"--project",f.root,"--plan","source-plan.json",...extra],{encoding:"utf8"});assert.equal(run([]).status,0);const pre=run(["--screen","V3-S1","--attempt","1","--tool-schema","tool-schema.json","--tool","imageEdit","--ledger","ledger.json"]);assert.equal(pre.status,0,pre.stderr);assert.equal(JSON.parse(pre.stdout).status,"prepared");assert.equal(run(["--screen","V3-S1"]).status,1);
}));

test("ledger validation rejects missing, reordered and post-acceptance attempts",async()=>using(async f=>{
 const first=await produce(f,f.args,false);
 const second=await produce(f,{...f.args,attempt:2,ledger:first.ledger},false);
 assert.throws(()=>verifySourceLedger(f.plan,{...second.ledger,records:[second.record]},{project:f.root}),/contiguous/);
 assert.throws(()=>verifySourceLedger(f.plan,{...second.ledger,records:[second.record,first.record]},{project:f.root}),/contiguous/);
 const accepted={...first.record,verdict:"accepted",review:{...first.record.review,composition:"accepted",businessFidelity:"accepted",findings:[]}};
 assert.throws(()=>verifySourceLedger(f.plan,{...second.ledger,records:[accepted,second.record]},{project:f.root}),/after acceptance/);
}));
test("selected-only source plan binds actual full-set approval, not unselected comparison history",async()=>using(async f=>{
 const t=transitionFixture();
 for(const source of t.evidence.screens){const p=path.join(f.root,"comparison",source.id+".png");mkdirSync(path.dirname(p),{recursive:true});writeFileSync(p,"historical comparison "+source.id);source.path=p;source.sha256=sha256(readFileSync(p));source.review.inspectedPath=p;source.review.inspectedSha256=source.sha256;}
 t.selection.selectedAnchorPath=t.evidence.candidates[2].path;t.selection.selectedAnchorSha256=t.evidence.candidates[2].sha256;t.selection.evidenceHash=sha256(t.evidence);t.selection.evidencePath=f.json("comparison.json",t.evidence);
 f.plan.screens=t.manifest.variants[2].screens.map((screen,i)=>({id:screen.id,variantId:"V3",purpose:screen.purpose,role:["main-path","main-path","outcome","critical-recovery"][i],nextScreen:screen.nextScreen,attemptLimit:2,links:{specificationIds:["SPEC"],scenarioIds:[],decisionIds:[],screenStateIds:[],verificationIds:[]}}));
 f.ledger.sourcePlanHash=sha256(f.plan);let ledger=f.ledger;const screens=[];
 for(const screen of f.plan.screens){const result=await produce(f,{...f.args,screenId:screen.id,ledger});ledger=result.ledger;screens.push({...structuredClone(t.set.screens.find(s=>s.id===screen.id)),path:result.record.path,sha256:result.record.sha256,review:result.record.review});}
 t.set.screens=screens;t.set.approval.screenSetHash=sha256(screens);
 const g3={schemaVersion:2,gate:"G3",status:"screen-set-approved",verdict:"pass",owner:"fixture-owner",scope:t.selection.scope,timestamp:"2026-10-19T10:00:00Z",evidencePath:f.json("set.json",t.set),evidenceHash:sha256(t.set),readyFor:"build-handoff",screenSetApproved:true,buildApproved:false};
 const request={schemaVersion:1,operation:"source-set-approval",workflow:"generated",involved:false,scope:t.selection.scope,target:"synthetic task",outcome:"synthetic result",owner:"fixture",timestamp:"2026-10-19T10:00:00Z",sourcePlan:f.json("source-plan.json",f.plan),sourceLedger:f.json("ledger.json",ledger),manifest:f.json("manifest.json",t.manifest),selection:f.json("g2.json",t.selection),sourceApproval:f.json("g3.json",g3)};
 const check=async(consume=false)=>{f.json("request.json",request);return checkTransition({project:f.root,requestPath:"request.json",consume});};
 const passed=await check();assert.equal(passed.status,"passed",passed.reason);assert.equal((await check(true)).status,"passed");
 request.sourceLedger=f.json("empty-ledger.json",{...ledger,records:[]});assert.match((await check()).reason,/accepted canonical/);
 delete request.sourceLedger;assert.equal((await check()).status,"blocked");request.sourceLedger="ledger.json";
 request.operation="source-selection";assert.match((await check()).reason,/accepted canonical/);
 request.operation="source-set-approval";assert.equal((await check()).status,"passed");writeFileSync(path.join(f.root,"specifications/product.json"),"changed");assert.match((await check(true)).reason,/dependency changed/);
},false));
