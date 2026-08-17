// Dev-only Product Design annotation intake for Nuxt (Nitro server route).
// Install at server/api/goose-annotate.post.ts in the target Nuxt project.
//
// Port of product-design's Vite `vite-annotate-plugin.mjs` middleware to a
// Nitro event handler. The running app's <AnnotationOverlay> POSTs a small
// JSON record (no screenshots, no binary payloads) here; this handler writes
// each record as its own file under .goose/annotations/inbox/ so a Goose
// session can pick it up later (see the product-design-annotate skill).
//
// CRITICAL DIFFERENCE FROM THE VITE VERSION: Vite's `configureServer` hook
// only registers annotation middleware for `vite dev`, structurally absent
// from `vite build` output. A Nitro server route has no equivalent
// structural exclusion from a production build — it ships unless guarded.
// This handler guards itself at request time (503 outside development).
// Delete this file (and the overlay component/import) before a production
// deploy if you want zero footprint instead of relying on the runtime guard.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_BODY_BYTES = 2_000_000; // annotations are small JSON only

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV !== "development") {
    setResponseStatus(event, 503);
    return { ok: false, error: "Annotation intake is dev-only" };
  }

  const contentLength = Number(getRequestHeader(event, "content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    setResponseStatus(event, 413);
    return { ok: false, error: "Payload too large" };
  }

  let record: Record<string, unknown>;
  try {
    record = await readBody(event);
  } catch (error) {
    setResponseStatus(event, 400);
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }

  record.receivedAt = new Date().toISOString();

  const inboxDir = path.join(process.cwd(), ".goose", "annotations", "inbox");
  await mkdir(inboxDir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
  await writeFile(path.join(inboxDir, filename), JSON.stringify(record, null, 2), "utf8");

  return { ok: true, filename };
});
