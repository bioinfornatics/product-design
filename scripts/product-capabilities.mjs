/** Image operation is reviewed from the current exposed tool, never inferred from its vendor name. */
export function inspectImageTool({ name, capabilities = [], inputSchema } = {}) {
  if (typeof name !== "string" || !name.trim()) throw new Error("actual image tool name required");
  if (!Array.isArray(capabilities) || capabilities.some(c => typeof c !== "string")) throw new Error("reviewed image capabilities required");
  const p = inputSchema?.type === "object" ? inputSchema.properties : null;
  return { name, operations: capabilities.filter(c => c === "image-generate" || c === "image-edit"), exactDestination: p?.workspace_output_path?.type === "string" && p?.save_to_workspace?.type === "boolean" };
}
const fail = message => { throw new Error(message); };
const allowed = new Set(["filesystem-read", "filesystem-write", "shell", "image-generate", "image-edit", "image-inspect", "browser-capture", "browser-interact", "hosting"]);

/** Transient inventory supplied from the current host's exposed tools, not persisted provider configuration.
 * Entries have name, capabilities, and actual inputSchema for image tools. No vendor-name guessing.
 */
export function inspectProductCapabilities(tools) {
  if (!Array.isArray(tools)) fail("current exposed tools must be an explicit array");
  const seen = new Set();
  const entries = tools.map(tool => {
    if (!tool || typeof tool.name !== "string" || !tool.name.trim() || seen.has(tool.name)) fail("unique tool name required");
    seen.add(tool.name);
    if (!Array.isArray(tool.capabilities) || new Set(tool.capabilities).size !== tool.capabilities.length || tool.capabilities.some(c => !allowed.has(c))) fail("explicit supported capability labels required");
    const p = tool.inputSchema?.type === "object" ? tool.inputSchema.properties : null;
    const image = tool.capabilities.some(c => c === "image-generate" || c === "image-edit");
    const exactDestination = image ? inspectImageTool(tool).exactDestination : null;
    return { name: tool.name, capabilities: [...tool.capabilities], exactDestination, verification: "availability-only" };
  });
  return { schemaVersion: 1, kind: "product-design-capabilities", tools: entries, verification: "availability-only", limitations: ["Capability labels are reviewed declarations from current host tools, not inferred from names.", "Presence/schema does not prove provider connectivity, authorized workspace, capture, user approval or successful deployment."] };
}
export function checkPhaseCapabilities(report, phase) {
  if (report?.kind !== "product-design-capabilities") fail("capability report required");
  const phases = {
    discovery: ["filesystem-read"],
    ideation: ["filesystem-read", "image-generate", "image-inspect"],
    "source-edit": ["filesystem-read", "image-edit", "image-inspect"],
    "url-capture": ["browser-capture", "image-inspect"],
    "prototype-build": ["filesystem-read", "filesystem-write", "shell"],
    "design-qa": ["browser-capture", "browser-interact", "image-inspect"],
    annotation: ["filesystem-read", "filesystem-write", "browser-capture", "browser-interact", "image-inspect"],
    share: ["hosting"],
  };
  if (!phases[phase]) fail("unsupported capability phase");
  const required = phases[phase], missing = required.filter(c => !report.tools.some(t => t.capabilities.includes(c) && (!(c === "image-generate" || c === "image-edit") || t.exactDestination)));
  return { phase, status: missing.length ? "blocked" : "available", missing, execution: "not-run", authorization: "Capability availability does not grant a transition, recording, browser choice, build or deployment authorization." };
}
