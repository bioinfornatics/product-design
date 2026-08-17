// Dev-only Vite middleware for the Product Design annotation overlay.
//
// The running prototype POSTs small JSON annotation records (no screenshots,
// no binary payloads) to /__goose-annotate. This plugin writes each record as
// its own file under .goose/annotations/inbox/ so a Goose session can pick
// them up on a later turn (see plugins/product-design/skills/product-design-annotate).
//
// Nothing here runs in a production build: the plugin only registers the
// middleware in `configureServer`, which Vite only calls for `vite dev`.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export function gooseAnnotatePlugin() {
  return {
    name: "goose-annotate",
    configureServer(server) {
      const root = server.config.root || process.cwd();
      const inboxDir = path.join(root, ".goose", "annotations", "inbox");

      server.middlewares.use("/__goose-annotate", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
          // Guard against runaway payloads; annotations are small JSON only.
          if (body.length > 2_000_000) {
            req.destroy();
          }
        });

        req.on("end", () => {
          try {
            const record = JSON.parse(body);
            record.receivedAt = new Date().toISOString();

            mkdirSync(inboxDir, { recursive: true });
            const filename = `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}.json`;
            writeFileSync(
              path.join(inboxDir, filename),
              JSON.stringify(record, null, 2),
              "utf8",
            );

            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true, filename }));
          } catch (error) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                ok: false,
                error: error instanceof Error ? error.message : String(error),
              }),
            );
          }
        });
      });
    },
  };
}
