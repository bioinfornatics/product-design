import { lstatSync, realpathSync, readFileSync } from "node:fs";
import path from "node:path";
export function productRoot(project) {
  if (typeof project !== "string" || !path.isAbsolute(project)) throw new Error("explicit absolute product root required");
  const root = realpathSync(project); if (!lstatSync(root).isDirectory()) throw new Error("product root must be a directory"); return root;
}
export function productFile(project, relative, { maxBytes = 1024 * 1024 } = {}) {
  const root = productRoot(project);
  if (typeof relative !== "string" || !relative || path.win32.isAbsolute(relative) || path.posix.isAbsolute(relative) || /[\\\x00-\x1f\x7f]/.test(relative) || relative.split("/").some(p => !p || p === "." || p === "..")) throw new Error("safe project-relative file required");
  let file = root;
  for (const component of relative.split("/")) { file = path.join(file, component); if (lstatSync(file).isSymbolicLink()) throw new Error("product paths cannot contain symlinks"); }
  const stat = lstatSync(file); if (!stat.isFile() || stat.size > maxBytes) throw new Error("bounded regular product file required");
  return { path: relative, absolutePath: file, bytes: readFileSync(file) };
}
