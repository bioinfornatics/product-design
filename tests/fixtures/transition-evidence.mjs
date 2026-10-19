// Synthetic data only: not visual quality or user evidence.
import { sha256 } from "../../scripts/workflow-evidence-contract.mjs";
import { manifestFingerprint } from "../../scripts/ideation-contract.mjs";
export function fixture(scope="multi-step", evidenceMode=scope==="multi-step"?"full-evidence":"lean") {
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
