# Local Prototype Preflight

Use this before creating a new local prototype.

- Keep the work self-contained in the new project folder.
- Plugin UI icons live in `../assets/`. Do not put prototype starter code or generated app assets there.
- Four bundled starters exist, one per supported framework: `../templates/prototype/` (Vite, default), `../templates/nextjs/`, `../templates/nuxt/`, `../templates/astro/`. `$get-context` resolves which one to use before this step; do not scaffold before that's settled.
- Create the app with the bootstrap script. Resolve the script path relative to this file, then run it with an absolute path:

```bash
node /absolute/path/to/plugins/product-design/scripts/bootstrap-prototype.mjs --dest /absolute/path/to/new-prototype --framework vite
```

Replace `--framework vite` with `nextjs`, `nuxt`, or `astro` as resolved by `$get-context`. Omitting `--framework` defaults to `vite`.

- Every bundled starter, in every framework, ships the annotation overlay pre-wired (see `$annotate`) — no extra setup needed after scaffolding.
- Run `npm install` from the generated project root. The Vite starter includes its own `.npmrc` for a local install cache; the others use the default npm cache.
- Do not replace the starter with static HTML because package install is slow. If install is genuinely blocked, report the blocker.
- Do not start a server until the route is ready to build.
