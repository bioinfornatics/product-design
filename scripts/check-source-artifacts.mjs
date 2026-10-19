#!/usr/bin/env node
import { readFileSync, realpathSync, lstatSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { verifySourcePlanFiles, sourceImpact, verifySourceLedger, prepareSourceAttempt } from "./source-artifacts.mjs";
export function checkSources(values) {
  if(!values.project || !values.plan)throw new Error("--project and --plan required");
  const root=realpathSync(path.resolve(values.project));
  const load=value=>{if(!value)throw new Error("explicit local JSON path required");const p=path.resolve(root,value),r=path.relative(root,p);if(r===".."||r.startsWith(".."+path.sep)||path.isAbsolute(r))throw new Error("input escapes project");let cursor=root;for(const c of r.split(path.sep)){cursor=path.join(cursor,c);if(lstatSync(cursor).isSymbolicLink())throw new Error("input symlink unsupported");}return JSON.parse(readFileSync(p));};
  const plan=load(values.plan);
  if(values.impact){if(values.screen||values.attempt||values.ledger||values["tool-schema"]||values.tool)throw new Error("--impact is a separate read-only operation");return sourceImpact(plan,{project:root});}
  const files=verifySourcePlanFiles(plan,{project:root});
  const ledger=values.ledger?load(values.ledger):undefined;
  if(values.screen || values.attempt || values["tool-schema"] || values.tool){if(!values.screen||!values.attempt||!values["tool-schema"]||!values.tool||!ledger)throw new Error("--screen, --attempt, --tool-schema, --tool and --ledger required together");const prepared=prepareSourceAttempt({project:root,plan,screenId:values.screen,attempt:Number(values.attempt),toolSchema:load(values["tool-schema"]),toolName:values.tool,ledger});return {status:"prepared",...prepared,authorization:"Destination prepared only; no image call, review or approval executed"};}
  if(ledger)verifySourceLedger(plan,ledger,{project:root});
  return {status:"passed",filesChecked:files.length,recordsChecked:ledger?.records.length??0,authorization:"Structural links and file identity only; no human approval or UX evidence"};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const {values}=parseArgs({options:{project:{type:"string"},plan:{type:"string"},ledger:{type:"string"},screen:{type:"string"},attempt:{type:"string"},"tool-schema":{type:"string"},tool:{type:"string"},impact:{type:"boolean",default:false},help:{type:"boolean",default:false}}});if(values.help)console.log("check-source-artifacts --project <root> --plan <json> [--impact | --ledger <json> | --screen ID --attempt N --tool-schema <json> --tool imageGenerate/imageEdit --ledger <json>]\nNo image calls, app mutation or approvals.");else{const result=checkSources(values);console.log(JSON.stringify(result,null,2));if(result.status==="review-required")process.exitCode=1;}}
  catch(error){console.error(JSON.stringify({status:"blocked",reason:error.message}));process.exitCode=1;}
}
