import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { experienceFixture } from '../tests/fixtures/experience-blueprint.mjs';
import { sha256, validateExperienceBlueprint } from './workflow-evidence-contract.mjs';
import { checkTransition } from './check-workflow-evidence.mjs';
import { validateSourcePlan } from './source-artifacts.mjs';
import { readProductSlice, validateProductReferences } from './read-product-slice.mjs';
function fixture(t) {
  const project = mkdtempSync(path.join(tmpdir(), 'pd-graph-regressions-'));
  t.after(() => rmSync(project, { recursive: true, force: true }));
  const put = (p, data) => { const dest = path.join(project, p); mkdirSync(path.dirname(dest), { recursive: true }); writeFileSync(dest, typeof data === 'string' ? data : JSON.stringify(data)); return dest; };
  const experience = experienceFixture();
  put('contract.json', experience.designContract); put('blueprint.json', experience.blueprint); put('spec.md', 'Preserve the editable draft.');
  const plan = { schemaVersion: 1, kind: 'product-design-source-plan', journeyId: 'comparison', sessionId: 'one', involved: false, specificationSources: [{ id: 'SPEC', path: 'spec.md', sha256: sha256(readFileSync(path.join(project, 'spec.md'))), revision: '1', authority: 'current' }], screens: [{ id: 'S1', variantId: 'V1', purpose: 'Compare revisions', role: 'isolated', nextScreen: 'End', attemptLimit: 1, links: { specificationIds: ['SPEC'], scenarioIds: [], decisionIds: [], screenStateIds: [], verificationIds: [] } }] };
  put('plan.json', plan);
  const args = { project, documents: ['contract.json', 'blueprint.json'], seeds: ['blueprint.json#decisions/D2'] };
  return { project, put, experience, plan, args };
}
const freshness = slice => slice.diagnostics.find(d => d.type === 'dependency-freshness');
test('F1: real published and consumed receipt is current, then exactly one dependency stale', async t => {
  const f = fixture(t), receiptPath = '.gates/brief-to-ideation.receipt.json';
  f.put('request.json', { schemaVersion: 1, operation: 'brief-to-ideation', workflow: 'generated', involved: false, scope: 'comparison', target: 'review workspace', outcome: 'compare revisions', owner: 'fixture', timestamp: '2026-10-19T10:00:00Z', sourcePlan: 'plan.json' });
  assert.equal((await checkTransition({ project: f.project, requestPath: 'request.json' })).status, 'passed');
  const consumed = await checkTransition({ project: f.project, requestPath: 'request.json', consume: true });
  assert.equal(consumed.status, 'passed'); assert.equal(consumed.consumed, true);
  const receiptBytes = readFileSync(path.join(f.project, receiptPath));
  const args = { project: f.project, documents: [receiptPath, 'spec.md'], seeds: [receiptPath], direction: 'up' };
  const current = readProductSlice(args); assert.equal(freshness(current).status, 'current');
  assert.equal(current.nodes.filter(n => n.reference?.path === 'spec.md').length, 1);
  assert.ok(current.edges.some(e => e.from === 'spec.md' && e.to === receiptPath));
  f.put('spec.md', 'One changed dependency.'); const changed = freshness(readProductSlice(args));
  assert.equal(changed.status, 'stale'); assert.deepEqual(changed.changes.map(d => d.path), ['spec.md']);
  assert.deepEqual(readFileSync(path.join(f.project, receiptPath)), receiptBytes);
});
test('F1: inaccessible, outside-root, symlink, oversized and unsupported dependencies are unknown', t => {
  const f = fixture(t); symlinkSync(path.join(f.project, 'spec.md'), path.join(f.project, 'linked.md')); f.put('large.md', 'x'.repeat(1024 * 1024 + 1));
  const paths = [path.join(f.project, '../outside.md'), path.join(f.project, 'missing.md'), path.join(f.project, 'linked.md'), path.join(f.project, 'large.md'), '../outside.md', 3];
  f.put('result.json', { dependencies: [...paths.map(p => ({ path: p, sha256: 'a'.repeat(64) })), null] });
  const s = readProductSlice({ project: f.project, documents: ['result.json'], seeds: ['result.json'] });
  const d = freshness(s); assert.equal(d.status, 'unknown'); assert.deepEqual(d.changes, []); assert.equal(d.unresolved.length, paths.length + 1);
  assert.ok(d.unresolved.some(x => /outside.*root/.test(x.reason))); assert.equal(s.edges.length, 0);
});
test('F4: intents join owning contract persona/scenario, not same-named blueprint collections', t => {
  const f = fixture(t); f.experience.blueprint.scenarios = [{ id: 'SC1' }]; f.put('blueprint.json', f.experience.blueprint);
  validateExperienceBlueprint(f.experience.blueprint, f.experience.designContract);
  const intent = readProductSlice({ ...f.args, seeds: ['blueprint.json#intents/I1'], direction: 'up' });
  assert.deepEqual(intent.nodes.map(n => n.id).sort(), ['blueprint.json#intents/I1', 'contract.json#personas/coordinator', 'contract.json#scenarios/SC1'].sort());
  assert.ok(intent.edges.some(e => e.type === 'intent-for-persona')); assert.ok(intent.edges.some(e => e.type === 'intent-in-scenario'));
  const persona = readProductSlice({ ...f.args, seeds: ['contract.json#personas/coordinator'], direction: 'down' }); assert.ok(persona.nodes.some(n => n.id === 'blueprint.json#intents/I1'));
  f.put('other-contract.json', f.experience.designContract);
  const ambiguous = readProductSlice({ ...f.args, documents: [...f.args.documents, 'other-contract.json'], seeds: ['blueprint.json#intents/I1'], direction: 'up' });
  assert.equal(ambiguous.edges.length, 0); assert.ok(ambiguous.diagnostics.some(d => /ambiguous/.test(d.reason ?? '')));
});
test('F4: specification file -> plan specification -> screen, with separate partial coverage', t => {
  const f = fixture(t); validateSourcePlan(f.plan);
  const s = readProductSlice({ project: f.project, documents: ['spec.md', 'plan.json'], seeds: ['spec.md'], direction: 'down' });
  assert.deepEqual(s.nodes.map(n => n.id), ['spec.md', 'plan.json#specificationSources/SPEC', 'plan.json#screens/S1']);
  assert.deepEqual(s.edges.map(e => e.type), ['specification-file-for', 'source-for']);
  assert.equal(s.truncated, false); assert.equal(s.graphCoverage.status, 'partial');
  assert.ok(s.diagnostics.some(d => d.type === 'relation-coverage' && d.status === 'partial'));
  assert.ok(s.diagnostics.some(d => d.type === 'source-impact' && d.status === 'unchanged'));
});
test('F6: owner-valid punctuation, Unicode and whitespace IDs roundtrip without renaming', t => {
  const f = fixture(t);
  for (const id of ['decision:prepare', 'décision 日本語', ' keep spaces ', 'D/#%25', String.fromCharCode(0xd800)]) {
    const exp = JSON.parse(JSON.stringify(experienceFixture()).replaceAll('"D2"', JSON.stringify(id)));
    validateExperienceBlueprint(exp.blueprint, exp.designContract); f.put('blueprint.json', exp.blueprint);
    const ref = { path: 'blueprint.json', entity: { collection: 'decisions', id } };
    assert.equal(validateProductReferences({ project: f.project, references: [ref] })[0].status, 'resolved');
    const s = readProductSlice({ ...f.args, seeds: [ref], direction: 'down' });
    assert.deepEqual(s.nodes[0].reference, ref); assert.equal(s.nodes[0].data.id, id);
    assert.ok(s.nodes.some(n => n.id === 'blueprint.json#screenStates/SS2'));
  }
});
test('F7: document/entity percent and delimiter collisions are distinct in both insertion orders', t => {
  const f = fixture(t); f.put('blueprint.json#decisions/D1', 'Not the entity'); f.put('a#b.md', 'hash'); f.put('a%23b.md', 'percent');
  const refs = [{ path: 'blueprint.json', entity: { collection: 'decisions', id: 'D1' } }, { path: 'blueprint.json#decisions/D1' }, { path: 'a#b.md' }, { path: 'a%23b.md' }];
  const results = validateProductReferences({ project: f.project, references: refs }); assert.equal(new Set(results.map(r => r.id)).size, refs.length);
  for (const order of [refs, [...refs].reverse()]) {
    const docs = [...new Set(order.map(r => r.path))];
    for (const ref of refs) { const s = readProductSlice({ project: f.project, documents: docs, seeds: [ref] }); assert.deepEqual(s.nodes[0].reference, ref); }
    assert.throws(() => readProductSlice({ project: f.project, documents: docs, seeds: ['blueprint.json#decisions/D1'] }), /ambiguous.*seed/);
    for (const resolved of results) assert.equal(readProductSlice({ project: f.project, documents: docs, seeds: ['ref:' + resolved.id] }).nodes[0].id, resolved.id);
  }
});
test('F7: slash/percent collection and ID tuples cannot alias', t => {
  const f = fixture(t); f.put('entities.json', { 'a/b': [{ id: 'c' }], a: [{ id: 'b/c' }, { id: 'b%2Fc' }], anchor: [{ id: 'section' }] });
  const refs = [{ path: 'entities.json', entity: { collection: 'a/b', id: 'c' } }, { path: 'entities.json', entity: { collection: 'a', id: 'b/c' } }, { path: 'entities.json', entity: { collection: 'a', id: 'b%2Fc' } }, { path: 'entities.json', entity: { collection: 'anchor', id: 'section' } }];
  const r = validateProductReferences({ project: f.project, references: refs }); assert.equal(new Set(r.map(x => x.id)).size, refs.length);
  const s = readProductSlice({ project: f.project, documents: ['entities.json'], seeds: refs }); assert.equal(s.nodes.length, refs.length);
});
test('F8: malformed drafts and scalar JSON preserve valid seeds and other documents', t => {
  const f = fixture(t);
  for (const value of [null, 'draft', 3, []]) {
    const exp = experienceFixture(); for (const c of ['screenStates', 'questions', 'verifications', 'intents']) exp.blueprint[c].push(value);
    exp.blueprint.questions[0].decisionIds = 'D1'; exp.blueprint.screenStates[0].decisionIds = {};
    f.put('blueprint.json', exp.blueprint); f.put('scalar.json', JSON.stringify(value));
    const s = readProductSlice({ ...f.args, documents: [...f.args.documents, 'scalar.json'], seeds: ['blueprint.json#decisions/D2', 'scalar.json'] });
    assert.ok(s.nodes.some(n => n.id === 'blueprint.json#decisions/D2')); assert.ok(s.diagnostics.some(d => d.status === 'invalid-blueprint')); assert.ok(s.diagnostics.some(d => d.status === 'invalid-member'));
    assert.equal(s.edges.some(e => e.from === 'blueprint.json#decisions/D1'), false);
  }
});
test('F8: malformed plan links and JSON diagnose without extracting unsupported edges', t => {
  const f = fixture(t);
  for (const change of [p => { p.screens.push(null); }, p => { p.screens[0].links = 'wrong'; }, p => { p.screens[0].links.specificationIds = 'SPEC'; }, p => { p.specificationSources = null; }]) {
    const p = structuredClone(f.plan); change(p); f.put('plan.json', p); f.put('invalid.json', '{oops');
    const s = readProductSlice({ ...f.args, documents: [...f.args.documents, 'plan.json', 'invalid.json'] });
    assert.ok(s.diagnostics.some(d => d.path === 'plan.json' && d.type === 'source-impact' && d.status === 'unresolved'));
    assert.ok(s.diagnostics.some(d => d.path === 'invalid.json' && d.status === 'unresolved'));
    assert.equal(s.edges.some(e => e.provenance.path === 'plan.json'), false);
  }
});

test('F7: shared identity helper separates anchor/entity, literal percent and task/document namespaces', async t => {
  const { productReference, productNodeId } = await import('./product-reference-identity.mjs');
  const pairs = [
    [{ path: 'reason.md', anchor: 'section' }, { path: 'reason.md', entity: { collection: 'anchor', id: 'section' } }],
    [{ path: 'a#b.md' }, { path: 'a%23b.md' }],
    [{ path: 'a.json', entity: { collection: 'a/b', id: 'c' } }, { path: 'a.json', entity: { collection: 'a', id: 'b/c' } }],
    [{ path: 'a.json', entity: { collection: 'c', id: String.fromCharCode(0xd800) } }, { path: 'a.json', entity: { collection: 'c', id: '%uD800' } }],
  ];
  for (const [a, b] of pairs) assert.notEqual(productNodeId(a), productNodeId(b));
  assert.equal(productNodeId({ path: '.beads/issue/closed-1' }), '%2Ebeads/issue/closed-1');
  assert.notEqual(productNodeId({ path: '%2Ebeads/issue/closed-1' }), productNodeId({ path: '.beads/issue/closed-1' }));
  const ref = { path: 'blueprint.json', entity: { collection: 'déclarations /', id: ' exact ID ' } };
  assert.deepEqual(productReference(ref), ref); assert.throws(() => productReference({ path: 'reason.md', anchor: 'has space' }));
  assert.throws(() => productReference({ path: 'reason.md', anchor: 'section', entity: { collection: 'c', id: '1' } }));
  const f = fixture(t); f.put('reason.md', '<a id="section"></a>Retain this rationale.');
  const s = readProductSlice({ project: f.project, seeds: [{ path: 'reason.md', anchor: 'section' }, { path: 'reason.md' }] });
  assert.equal(s.nodes.length, 2); assert.match(s.nodes[0].data.excerpt, /Retain this rationale/);
});

test('F8: duplicate entity documents fail closed, including explicit object seed resurrection', t => {
  const f = fixture(t); f.experience.blueprint.decisions.push(f.experience.blueprint.decisions[0]); f.put('blueprint.json', f.experience.blueprint);
  const s = readProductSlice({ ...f.args, seeds: ['contract.json#scenarios/SC1'] });
  assert.ok(s.diagnostics.some(d => d.path === 'blueprint.json' && /duplicate/.test(d.reason)));
  assert.equal(s.nodes.some(n => n.reference?.path === 'blueprint.json'), false);
  assert.throws(() => readProductSlice({ ...f.args, seeds: [{ path: 'blueprint.json', entity: { collection: 'decisions', id: 'D2' } }] }), /seed does not resolve/);
  assert.throws(() => readProductSlice({ ...f.args, seeds: ['blueprint.json#decisions/D1'] }), /seed does not resolve/);
});

test('F1: mixed changed/unresolved dependencies retain both findings and join equivalent paths', t => {
  const f = fixture(t), actual = sha256(readFileSync(path.join(f.project, 'spec.md')));
  for (const dependencies of [null, {}, 'wrong']) {
    f.put('result.json', { dependencies });
    const d = freshness(readProductSlice({ project: f.project, documents: ['result.json'], seeds: ['result.json'] }));
    assert.equal(d.status, 'unknown'); assert.deepEqual(d.changes, []);
  }
  f.put('result.json', { dependencies: [{ path: 'spec.md', sha256: actual }, { path: path.join(f.project, 'spec.md'), sha256: 'a'.repeat(64) }, { path: 'missing.md', sha256: actual }, { path: 'spec.md', sha256: [actual] }] });
  const s = readProductSlice({ project: f.project, documents: ['result.json', 'spec.md'], seeds: ['result.json'], direction: 'up' });
  assert.equal(freshness(s).status, 'stale'); assert.equal(freshness(s).changes.length, 1); assert.equal(freshness(s).unresolved.length, 2);
  assert.equal(s.nodes.filter(n => n.id === 'spec.md').length, 1); assert.equal(s.edges.length, 1);
});

test('F4: involved source-plan links respect exact declared owner despite same-ID documents', t => {
  const f = fixture(t);
  const bind = p => ({ path: p, sha256: sha256(readFileSync(path.join(f.project, p))) });
  f.plan.involved = true; f.plan.context = { designContract: bind('contract.json'), blueprint: bind('blueprint.json') };
  f.plan.screens = f.experience.blueprint.screenStates.map((s, i) => ({ id: s.screenId, variantId: 'V3', purpose: s.question, role: i ? 'outcome' : 'main-path', nextScreen: i ? 'End' : 'V3-S2', attemptLimit: 1, links: { specificationIds: ['SPEC'], scenarioIds: [s.scenarioId], decisionIds: s.decisionIds, screenStateIds: [s.id], verificationIds: ['T' + (i + 1)] } }));
  validateSourcePlan(f.plan); f.put('plan.json', f.plan); f.put('other-contract.json', f.experience.designContract); f.put('other-blueprint.json', f.experience.blueprint);
  const args = { ...f.args, documents: [...f.args.documents, 'plan.json', 'other-contract.json', 'other-blueprint.json'], seeds: ['plan.json#screens/V3-S2'], direction: 'up', limits: { maxDepth: 1 } };
  const s = readProductSlice(args);
  assert.ok(s.nodes.some(n => n.id === 'contract.json#scenarios/SC2'));
  assert.ok(s.nodes.some(n => n.id === 'blueprint.json#decisions/D2'));
  assert.equal(s.nodes.some(n => n.reference?.path.startsWith('other-')), false);
  const missing = readProductSlice({ ...args, documents: args.documents.filter(p => p !== 'blueprint.json') });
  assert.equal(missing.nodes.some(n => n.id === 'other-blueprint.json#decisions/D2'), false);
  f.experience.blueprint.decisions[0].detail += ' changed'; f.put('blueprint.json', f.experience.blueprint);
  const impact = readProductSlice(args).diagnostics.find(d => d.type === 'source-impact');
  assert.equal(impact.status, 'review-required'); assert.deepEqual(impact.affectedScreenIds, ['V3-S1', 'V3-S2']);
});


test('F7: encoded CLI seeds select exact filenames, never a colliding entity', t => {
  const f = fixture(t); f.put('blueprint.json#decisions/D1', 'File, not entity');
  const script = fileURLToPath(new URL('./read-product-slice.mjs', import.meta.url));
  const args = [script, '--project', f.project, '--document', 'blueprint.json', '--document', 'blueprint.json#decisions/D1', '--seed'];
  const r = spawnSync(process.execPath, [...args, 'ref:blueprint.json%23decisions/D1'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr); assert.deepEqual(JSON.parse(r.stdout).nodes[0].reference, { path: 'blueprint.json#decisions/D1' });
  const bad = spawnSync(process.execPath, [...args, 'blueprint.json#decisions/D1'], { encoding: 'utf8' });
  assert.equal(bad.status, 1); assert.match(bad.stderr, /ambiguous.*seed/);
});

test('F7: synthetic read-only task and same-path document never overwrite one another', t => {
  const f = fixture(t), bin = path.join(f.project, 'bin'); mkdirSync(bin);
  // Entirely synthetic /tmp target; no actual tracker/configuration is read or changed.
  f.put('.beads/issue/closed-1', 'A distinct document, not the native issue.');
  const issue = { id: 'closed-1', title: 'Native synthetic task', status: 'closed' };
  const make = (name, body) => writeFileSync(path.join(bin, name), '#!' + process.execPath + String.fromCharCode(10) + body, { mode: 0o755 });
  make('git', 'console.log(' + JSON.stringify(f.project) + ')');
  make('bd', 'console.log(JSON.stringify(process.argv.includes("context") ? ' + JSON.stringify({ project_id: 'test', beads_dir: path.join(f.project, '.beads'), repo_root: f.project, is_redirected: false }) + ' : [' + JSON.stringify(issue) + ']))');
  const args = { project: f.project, documents: ['.beads/issue/closed-1'], tasks: ['closed-1'], env: { PATH: bin } };
  const s = readProductSlice({ ...args, seeds: ['ref:.beads/issue/closed-1', { path: '.beads/issue/closed-1' }] });
  assert.equal(s.nodes.length, 2); assert.equal(s.nodes[0].authority, 'beads'); assert.equal(s.nodes[1].reference.path, '.beads/issue/closed-1');
  assert.notEqual(s.nodes[0].id, s.nodes[1].id);
  assert.throws(() => readProductSlice({ ...args, seeds: ['.beads/issue/closed-1'] }), /ambiguous.*seed/);
});

test('F8: rejecting a duplicate-bearing owner cannot silently pick a competing owner', t => {
  const f = fixture(t); f.put('other-contract.json', f.experience.designContract);
  f.experience.designContract.scenarios.push(f.experience.designContract.scenarios[0]); f.put('contract.json', f.experience.designContract);
  const s = readProductSlice({ ...f.args, documents: [...f.args.documents, 'other-contract.json'], seeds: ['blueprint.json#intents/I1'], direction: 'up' });
  assert.equal(s.nodes.length, 1); assert.equal(s.edges.length, 0);
  assert.ok(s.diagnostics.some(d => d.path === 'contract.json' && /duplicate/.test(d.reason ?? '')));
  assert.ok(s.diagnostics.some(d => /ambiguous/.test(d.reason ?? '')));
});
