import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { validateIdeationManifest, manifestFingerprint, executeThreeLanes } from "./ideation-contract.mjs";
import { selectIdeationMode, sha256, validateIdeationEvidence, validateDirectionSelection, validateScreenSetEvidence, verifyLocalEvidenceFiles, advanceGateTransaction } from "./workflow-evidence-contract.mjs";

// Synthetic fixture proves declared coverage and orchestration, not pixel quality or UX.
function fixture(scope="multi-step", evidenceMode=scope==="multi-step"?"full-evidence":"lean") {
  const comparisonContract={scope,service:"Mentoring",userContext:"Employee",start:"Need an exchange",end:"Booking confirmed",scenarioData:"Fictional mentor A, agreed availability",successCriterion:"Find confirmation and return to request",platform:"desktop web",viewport:{width:1536,height:1024},visualContract:"Approved neutral design contract",references:[]};
  const variants=[1,2,3].map(v=>{
    const id="V"+v, count=scope==="multi-step"?4:1;
    const screens=Array.from({length:count},(_,i)=>({id:id+"-S"+(i+1),title:["Search","Book","Confirmation","Slot unavailable"][i],purpose:"Complete the bounded task",userQuestion:"What next?",entryState:"Frozen state "+i,journeyMoment:i===2?"Outcome":"Action",visibleContent:"Exact fictional data",actions:"Read, prepare, review then activate",recovery:"Retain request and choose another slot",exit:"Context preserved",nextScreen:scope==="single-screen"||i===2?"End":id+"-S2",canonicalPrompt:"One full-size screen "+id+"-S"+(i+1),visualContract:comparisonContract.visualContract,acceptanceCriteria:["Exact data","Outcome visible"],target:{aspectRatio:"3:2"},generation:{model:"gpt-image-2",size:"1536x1024",attempts:1,enhancement:false}}));
    return {id,title:["Guided","Task workspace","Outcome dossier"][v-1],thesis:"Interaction strategy "+v,outputDirectory:"generated/"+id,anchorScreenId:id+"-S1",...(scope==="multi-step"?{journey:{startScreenId:id+"-S1",outcomeScreenId:id+"-S3",criticalRecoveryScreenIds:[id+"-S4"]}}:{}),screens};
  });
  // Search -> booking -> outcome; recovery is a branch back to booking.
  if(scope==="multi-step")for(const v of variants)v.screens[1].nextScreen=v.id+"-S3";
  const manifest={schemaVersion:1,manifestId:"mentoring-"+scope,evidenceMode,comparisonContract,variants};
  const screens=variants.flatMap(v=>v.screens.map(s=>{
    const file="/tmp/pd-fixture/"+s.id+".png",hash=sha256(s.id);
    return {id:s.id,path:file,sha256:hash,provenance:"generated-candidate",criticalCopyReadable:true,buildSourceEligible:true,review:{inspectedPath:file,inspectedSha256:hash,reviewer:"fixture-reviewer",timestamp:"2026-10-18T20:00:00Z",composition:"accepted",businessFidelity:"accepted",findings:[]}};
  }));
  const evidence={schemaVersion:2,manifestFingerprint:manifestFingerprint(manifest),evidenceMode,mode:"visual-and-copy",candidates:variants.map(v=>screens.find(s=>s.id===v.anchorScreenId)),screens,fullJourneyCoverage:scope==="multi-step"};
  const selection={schemaVersion:2,gate:"G2",status:scope==="multi-step"?"journey-selected":"direction-selected",verdict:"pass",owner:"fixture-owner",scope:"Mentoring bounded scenario",timestamp:"2026-10-18T20:01:00Z",evidencePath:"/tmp/pd-fixture/comparison.json",evidenceHash:sha256(evidence),comparisonScope:scope,evidenceMode,selectedVariant:"V3",manifestFingerprint:evidence.manifestFingerprint,selectedAnchorPath:evidence.candidates[2].path,selectedAnchorSha256:evidence.candidates[2].sha256,readyFor:"selected-screen-production",screenSetApproved:false,buildApproved:false};
  const selected=screens.filter(s=>s.id.startsWith("V3-"));
  const set={schemaVersion:2,kind:"selected-screen-set",manifestFingerprint:evidence.manifestFingerprint,selectedVariant:"V3",screens:selected,approval:{owner:"fixture-owner",timestamp:"2026-10-18T20:02:00Z",statement:"Approve these exact fictional sources for the bounded prototype",screenSetApproved:true,screenSetHash:sha256(selected)}};
  return {manifest,evidence,selection,set};
}
function bind(f){f.evidence.manifestFingerprint=manifestFingerprint(f.manifest);f.selection.manifestFingerprint=f.evidence.manifestFingerprint;f.selection.evidenceHash=sha256(f.evidence);}
function finding(source){source.buildSourceEligible=false;source.review.businessFidelity="changes-required";source.review.findings=[{id:"business-copy",severity:"material",category:"action-state",detail:"Approved content presented as external delivery",evidence:"Exact source screen status label",status:"open"}];}

test("multi-step defaults full regardless of low risk; only explicit isolated scope can use lean",()=>{
  assert.deepEqual(selectIdeationMode(),{scope:"multi-step",mode:"full-evidence"});
  assert.equal(selectIdeationMode({scope:"single-screen"}).mode,"lean");
  assert.equal(selectIdeationMode({scope:"single-screen",materialRisk:true}).mode,"full-evidence");
  for(const args of [{requestedMode:"lean"},{scope:"single-screen",regulatedCopy:true,requestedMode:"lean"},{scope:"single-screen",journeyUncertainty:true,requestedMode:"lean"}])assert.throws(()=>selectIdeationMode(args),/requires full-evidence/);
  for(const args of [{scope:"landing-product"},{materialRisk:1},{requestedMode:"cheap"}])assert.throws(()=>selectIdeationMode(args),/unsupported|boolean/);
});

test("complete three journeys including recovery pass comparison, selection and selected-set shape",()=>{
  const f=fixture();assert.equal(validateIdeationManifest(f.manifest),f.manifest);assert.equal(validateIdeationEvidence(f.evidence,f.manifest),f.evidence);assert.equal(validateDirectionSelection(f.selection,f.evidence,f.manifest),f.selection);assert.equal(validateScreenSetEvidence(f.set,f.manifest,f.selection),f.set);
});

test("single-screen lean and risk-full are directions, never full journey claims",()=>{
  for(const mode of ["lean","full-evidence"]){const f=fixture("single-screen",mode);assert.equal(validateDirectionSelection(f.selection,f.evidence,f.manifest),f.selection);f.evidence.fullJourneyCoverage=true;assert.throws(()=>validateIdeationEvidence(f.evidence,f.manifest),/fullJourneyCoverage/);}
});

test("manifest rejects anchor shortcuts, scope omissions and hidden multi-step scope",async t=>{
  const cases={lean:f=>f.manifest.evidenceMode="lean",missingScope:f=>delete f.manifest.comparisonContract.scope,landingOnly:f=>f.manifest.variants[0].screens=f.manifest.variants[0].screens.slice(0,1),hiddenJourney:f=>f.manifest.comparisonContract.scope="single-screen"};
  for(const [name,mutate] of Object.entries(cases))await t.test(name,()=>{const f=fixture();mutate(f);assert.throws(()=>validateIdeationManifest(f.manifest),/full-evidence|scope|distinct outcome|exactly one/);});
});

test("manifest rejects broken boundaries, next links, cycles and unassigned recovery",async t=>{
  const cases={missingJourney:v=>delete v.journey,wrongStart:v=>v.journey.startScreenId="V1-S2",sameOutcome:v=>v.journey.outcomeScreenId="V1-S1",unknownOutcome:v=>v.journey.outcomeScreenId="missing",crossVariant:v=>v.screens[0].nextScreen="V2-S1",missingNext:v=>v.screens[0].nextScreen="unknown",truncated:v=>v.screens[0].nextScreen="End",cycle:v=>v.screens[1].nextScreen="V1-S1",outcomeContinues:v=>v.screens[2].nextScreen="V1-S2",orphan:v=>v.journey.criticalRecoveryScreenIds=[],missingRecovery:v=>delete v.journey.criticalRecoveryScreenIds,duplicateRecovery:v=>v.journey.criticalRecoveryScreenIds.push("V1-S4"),unknownRecovery:v=>v.journey.criticalRecoveryScreenIds=["missing"],recoveryCycle:v=>v.screens[3].nextScreen="V1-S4",recoveryOnMain:v=>v.journey.criticalRecoveryScreenIds=["V1-S2","V1-S4"]};
  for(const [name,mutate] of Object.entries(cases))await t.test(name,()=>{const f=fixture();mutate(f.manifest.variants[0]);assert.throws(()=>validateIdeationManifest(f.manifest),/journey|nextScreen|main path|outcome|orphan|recovery|Recovery/);});
});

test("execution generates all 12 planned screens, not three home anchors; persists prior screen before successor",async()=>{
  const f=fixture(),generated=[],persisted=new Set();
  const result=await executeThreeLanes({manifest:f.manifest,workspaceRoot:"/tmp/pd-fixture",generate:async input=>{generated.push(input.screenId);const n=Number(input.screenId.split("S")[1]);if(n>1){assert.ok(persisted.has(input.variantId+"-S"+(n-1)));assert.equal(input.anchorPath,"/tmp/pd-fixture/generated/"+input.variantId+"/"+input.variantId+"-S"+(n-1)+".png");}return {path:input.outputDirectory+"/"+input.screenId+".png"};},inspect:async({screen,returnedPath,anchorPath})=>({accepted:true,inspectedPath:returnedPath,sha256:sha256(screen.id),visualContractAccepted:true,continuityAccepted:anchorPath?true:undefined}),persist:async state=>{for(const [id,record] of Object.entries(state))if(record.status==="accepted")persisted.add(id);}});
  assert.equal(generated.length,12);assert.equal(Object.keys(result.state).length,12);for(const variant of f.manifest.variants)assert.deepEqual(generated.filter(id=>id.startsWith(variant.id+"-")),variant.screens.map(s=>s.id));
});

test("invalid lean multi-step manifest causes zero generation callbacks",async()=>{
  const f=fixture();f.manifest.evidenceMode="lean";let calls=0;
  await assert.rejects(()=>executeThreeLanes({manifest:f.manifest,workspaceRoot:"/tmp/pd-fixture",generate:async()=>{calls++;},inspect:async()=>{}}),/full-evidence/);assert.equal(calls,0);
});

test("explicit isolated lean execution produces exactly three directions",async()=>{
  const f=fixture("single-screen"),calls=[];
  const result=await executeThreeLanes({manifest:f.manifest,workspaceRoot:"/tmp/pd-fixture",generate:async x=>{calls.push(x.screenId);return {path:x.outputDirectory+"/"+x.screenId+".png"};},inspect:async({screen,returnedPath})=>({accepted:true,inspectedPath:returnedPath,sha256:sha256(screen.id),visualContractAccepted:true})});assert.equal(calls.length,3);assert.equal(Object.keys(result.state).length,3);
});

test("evidence rejects missing results/recovery, reordered or unplanned screens, duplicate versions and unbound reviews",async t=>{
  const cases={onlyAnchors:f=>f.evidence.screens=f.evidence.candidates,missingOutcome:f=>f.evidence.screens=f.evidence.screens.filter(s=>s.id!=="V2-S3"),missingRecovery:f=>f.evidence.screens=f.evidence.screens.filter(s=>s.id!=="V3-S4"),reordered:f=>[f.evidence.screens[1],f.evidence.screens[2]]=[f.evidence.screens[2],f.evidence.screens[1]],unplanned:f=>f.evidence.screens[1].id="V1-S99",duplicateId:f=>f.evidence.screens[1].id=f.evidence.screens[0].id,duplicateHash:f=>{const a=f.evidence.screens[1],b=f.evidence.screens[0];a.sha256=b.sha256;a.review.inspectedSha256=b.sha256;},unbound:f=>f.evidence.screens[1].review.inspectedPath="/tmp/other.png",unreadable:f=>f.evidence.screens[1].criticalCopyReadable=false,wrongMode:f=>f.evidence.evidenceMode="lean",falseCoverage:f=>f.evidence.fullJourneyCoverage=false,wrongFingerprint:f=>f.evidence.manifestFingerprint="0".repeat(64),anchorCopyDrift:f=>f.evidence.candidates[0]={...f.evidence.candidates[0],extra:"different record"}};
  for(const [name,mutate] of Object.entries(cases))await t.test(name,()=>{const f=fixture();mutate(f);assert.throws(()=>validateIdeationEvidence(f.evidence,f.manifest),/coverage|order|unplanned|duplicate|review|unreadable|mode|fingerprint|identical/);});
});

test("selection binds exact full comparison, scope, source and status; experiment preserves faulty direction without build eligibility",()=>{
  const f=fixture();finding(f.evidence.screens[9]);bind(f);
  assert.throws(()=>validateDirectionSelection(f.selection,f.evidence,f.manifest),/correction/);
  f.selection.verdict="experiment";assert.equal(validateDirectionSelection(f.selection,f.evidence,f.manifest),f.selection);assert.equal(f.selection.buildApproved,false);
  for(const mutate of [s=>s.evidenceHash="0".repeat(64),s=>s.selectedAnchorSha256="0".repeat(64),s=>s.selectedAnchorPath="/tmp/wrong.png",s=>s.comparisonScope="single-screen",s=>s.status="direction-selected",s=>s.buildApproved=true]){const g=fixture();mutate(g.selection);assert.throws(()=>validateDirectionSelection(g.selection,g.evidence,g.manifest),/hash|binding|status|build approval/);}
});

test("selected-set approval rejects missing/reordered/defective/stale/unapproved sources and scope drift",async t=>{
  const cases={missing:f=>f.set.screens.pop(),reordered:f=>f.set.screens.reverse(),faulty:f=>finding(f.set.screens[1]),staleApproval:f=>f.set.approval.screenSetHash="0".repeat(64),unapproved:f=>f.set.approval.screenSetApproved=false,wrongVariant:f=>f.set.selectedVariant="V2",wrongManifest:f=>f.set.manifestFingerprint="0".repeat(64),scopeDrift:f=>{f.selection.comparisonScope="single-screen";f.selection.status="direction-selected";}};
  for(const [name,mutate] of Object.entries(cases))await t.test(name,()=>{const f=fixture();mutate(f);assert.throws(()=>validateScreenSetEvidence(f.set,f.manifest,f.selection),/order|eligible|approval|binding/);});
});

test("filesystem hashes real files, rejects missing evidence and symlink escape without forbidding in-root links",()=>{
  const root=mkdtempSync(path.join(tmpdir(),"pd-e2e-files-")),outside=mkdtempSync(path.join(tmpdir(),"pd-e2e-outside-"));
  try{const file=path.join(root,"source.png");writeFileSync(file,"synthetic fixture");writeFileSync(path.join(outside,"source.png"),"synthetic fixture");symlinkSync(file,path.join(root,"internal.png"));symlinkSync(path.join(outside,"source.png"),path.join(root,"escape.png"));const source={id:"s",path:path.join(root,"internal.png"),sha256:sha256("synthetic fixture")};assert.equal(verifyLocalEvidenceFiles([source],{root})[0],source);assert.throws(()=>verifyLocalEvidenceFiles([{...source,path:path.join(root,"escape.png")}],{root}),/escapes/);assert.throws(()=>verifyLocalEvidenceFiles([{...source,path:path.join(root,"missing.png")}],{root}),/ENOENT/);}finally{rmSync(root,{recursive:true,force:true});rmSync(outside,{recursive:true,force:true});}
});

test("gate writes ordered evidence, gate, mirror and readiness; each callback failure halts downstream",async t=>{
  for(const stop of [null,"evidence","gate","mirror","readiness"])await t.test(stop??"success",async()=>{const f=fixture(),calls=[];const cb=name=>async()=>{calls.push(name);if(name===stop)throw new Error("failed "+name);};const action=()=>advanceGateTransaction({evidence:f.evidence,gate:f.selection,writeEvidence:cb("evidence"),writeGate:cb("gate"),mirrorBeads:cb("mirror"),writeReadiness:cb("readiness")});if(stop)await assert.rejects(action,/failed/);else assert.equal((await action()).readyFor,"selected-screen-production");const sequence=["evidence","gate","mirror","readiness"];assert.deepEqual(calls,stop?sequence.slice(0,sequence.indexOf(stop)+1):sequence);});
});

test("invalid gate binding performs no writes",async()=>{const f=fixture();f.selection.evidenceHash="0".repeat(64);let writes=0;const cb=async()=>{writes++;};await assert.rejects(()=>advanceGateTransaction({evidence:f.evidence,gate:f.selection,writeEvidence:cb,writeGate:cb,mirrorBeads:cb,writeReadiness:cb}),/hash/);assert.equal(writes,0);});
