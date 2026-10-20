/** Shared reference shape; owning validators accept nonempty text, not slug-only IDs.
 * Identity v1: encode each path component, collection and ID with percent escapes;
 * preserve path separators, then #collection/id or #anchor/name. Escape literal %.
 * Lone UTF-16 surrogates use %uXXXX (literal percent is always %25). Collection
 * "anchor" uses %61nchor to reserve the Markdown namespace. Document paths starting
 * .beads/issue/ escape the first dot to reserve native task IDs. Authored IDs do not
 * change. CLI ref:<canonical ID> disambiguates encoded IDs from legacy strings;
 * API object seeds always mean raw paths. No filesystem access or decoding here.
 */
const fail = message => { throw new Error(message); };
const text = v => typeof v === 'string' && !!v.trim();
const kinds = new Set(['affects', 'explained-by', 'verified-by']);
export function productReference(ref) {
  if (!ref || typeof ref !== 'object' || Array.isArray(ref) || typeof ref.path !== 'string' || !ref.path || (ref.anchor !== undefined && ref.entity !== undefined)) fail('reference needs path and at most one explicit anchor/entity');
  if (ref.relation !== undefined && !kinds.has(ref.relation)) fail('unsupported product reference relation');
  if (ref.anchor !== undefined && (typeof ref.anchor !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(ref.anchor))) fail('stable explicit Markdown anchor required');
  if (ref.entity !== undefined && (!ref.entity || Array.isArray(ref.entity) || !text(ref.entity.collection) || !text(ref.entity.id))) fail('qualified collection/entity ID required');
  return { path: ref.path, ...(ref.anchor !== undefined ? { anchor: ref.anchor } : {}), ...(ref.entity !== undefined ? { entity: { collection: ref.entity.collection, id: ref.entity.id } } : {}), ...(ref.relation !== undefined ? { relation: ref.relation } : {}) };
}
export function productIdentityPart(value) {
  return Array.from(value, char => char.length === 1 && char.charCodeAt(0) >= 0xd800 && char.charCodeAt(0) <= 0xdfff ? '%u' + char.charCodeAt(0).toString(16).toUpperCase() : encodeURIComponent(char)).join('');
}
export function productNodeId(raw) {
  const ref = productReference(raw);
  let file = ref.path.split('/').map(productIdentityPart).join('/');
  if (file.startsWith('.beads/issue/')) file = '%2E' + file.slice(1);
  if (ref.entity) return file + '#' + (ref.entity.collection === 'anchor' ? '%61nchor' : productIdentityPart(ref.entity.collection)) + '/' + productIdentityPart(ref.entity.id);
  return file + (ref.anchor !== undefined ? '#anchor/' + ref.anchor : '');
}
