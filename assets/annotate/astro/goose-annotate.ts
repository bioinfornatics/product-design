// Dev-only Product Design annotation intake for Astro.
// Install at src/pages/api/goose-annotate.ts in the target Astro project.
// Requires the project's Astro config to have `output: "server"` (or a
// hybrid/on-demand route override) — a fully static Astro site has no
// server to receive this POST at all; see the `annotate-inject` skill's
// Astro section before installing.
//
// Port of product-design's Vite `vite-annotate-plugin.mjs` middleware to an
// Astro API route. The running page's <AnnotationOverlay> island POSTs a
// small JSON record (no screenshots, no binary payloads) here; this handler
// writes each record as its own file under .goose/annotations/inbox/ so a
// Goose session can pick it up later (see the product-design-annotate skill).
//
// CRITICAL DIFFERENCE FROM THE VITE VERSION: Vite's `configureServer` hook
// only registers annotation middleware for `vite dev`, structurally absent
// from `vite build` output. An Astro API route has no equivalent structural
// exclusion from a production build — it ships unless guarded. This handler
// guards itself at request time (503 outside development). Delete this
// file (and the overlay island) before a production deploy for zero
// footprint instead of relying on the runtime guard alone.
import type { APIRoute } from "astro";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const prerender = false;

const MAX_BODY_BYTES = 2_000_000; // annotations are small JSON only

export const POST: APIRoute = async ({ request }) => {
  if (process.env.NODE_ENV !== "development") {
    return new Response(JSON.stringify({ ok: false, error: "Annotation intake is dev-only" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ ok: false, error: "Payload too large" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  let record: Record<string, unknown>;
  try {
    record = await request.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  record.receivedAt = new Date().toISOString();

  const inboxDir = path.join(process.cwd(), ".goose", "annotations", "inbox");
  await mkdir(inboxDir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
  await writeFile(path.join(inboxDir, filename), JSON.stringify(record, null, 2), "utf8");

  return new Response(JSON.stringify({ ok: true, filename }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
