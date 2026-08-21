#!/usr/bin/env node
import { cpSync, existsSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const temp=mkdtempSync(path.join(tmpdir(),"product-design-plugin-"));const stage=path.join(temp,"product-design");mkdirSync(stage);
const entries=["plugin.json","README.md","LICENSE","AGENTS.md","assets","docs","references","scripts","skills","templates","tests","package.json"];
for(const entry of entries){const source=path.join(root,entry);if(existsSync(source))cpSync(source,path.join(stage,entry),{recursive:true,filter:p=>!p.includes("node_modules")&&!p.includes("__pycache__")&&!p.endsWith(".pyc")&&!p.includes("/evaluations/")});}
const validator="/home/jmercier/.agents/plugins/open-agent-creators/skills/plugin-creator/dist/scripts/validate_goose_plugin.js";
const result=spawnSync(process.execPath,[validator,stage],{stdio:"inherit"});rmSync(temp,{recursive:true,force:true});process.exit(result.status??1);
