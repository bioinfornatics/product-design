import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";

// output: "server" is required for the /api/goose-annotate route to exist
// at all — a fully static ("output: 'static'") Astro build has no server,
// so the annotation intake endpoint would 404 regardless of NODE_ENV. If
// this prototype doesn't need annotation, switch back to static output and
// remove the annotate assets (see the `annotate-inject` skill).
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [react()],
});
