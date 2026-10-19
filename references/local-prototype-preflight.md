# Local Prototype Preflight

Use this before creating a new local prototype.

- Keep the work self-contained in the new project folder.
- Plugin UI icons live in `../assets/`. Do not put prototype starter code or generated app assets there.
- Four bundled starters exist, one per supported framework: `../templates/prototype/` (Vite, default), `../templates/nextjs/`, `../templates/nuxt/`, `../templates/astro/`. the loaded get-context Skill (instruction `load skills product-design:get-context`) resolves which one to use before this step; do not scaffold before that's settled.
- Create the app with the bootstrap script. Resolve the script path relative to this file, then run it with an absolute path:

```bash
node /absolute/path/to/plugins/product-design/scripts/bootstrap-prototype.mjs --dest /absolute/path/to/new-prototype --framework vite
```

Replace `--framework vite` with `nextjs`, `nuxt`, or `astro` as resolved by the loaded get-context Skill (instruction `load skills product-design:get-context`). Omitting `--framework` defaults to `vite`.

- Every bundled starter, in every framework, ships the annotation overlay pre-wired (see the loaded annotate Skill (instruction `load skills product-design:annotate`)) — no extra setup needed after scaffolding.
- Run `npm install` from the generated project root. The Vite starter includes its own `.npmrc` for a local install cache; the others use the default npm cache.
- Do not replace the starter with static HTML because package install is slow. If install is genuinely blocked, report the blocker.
- Do not start a server until the route is ready to build.

## Evidence workspace and authorized build

For an adapter-governed new build, keep the canonical project evidence workspace and bootstrap into its empty app/ subdirectory after a freshly consumed prototype-build receipt. Declare app/src, app/public, package/lockfiles and applicable config in G4 implementationPaths. The bootstrap refuses nonempty destinations: do not point it at a workspace already containing .gates or source captures, and do not delete evidence to make it empty. An existing application keeps its agreed root and infrastructure. See [executable transitions](executable-transitions.md).
