// Dev-only Product Design annotation intake for Next.js (App Router).
//
// Port of product-design's Vite `vite-annotate-plugin.mjs` middleware to a
// Next.js Route Handler, for injection into a user-provided Next.js
// boilerplate (see the `annotate-inject` skill). The running prototype's
// <AnnotationOverlay> POSTs a small JSON record (no screenshots, no binary
// payloads) here; this handler writes each record as its own file under
// .goose/annotations/inbox/ so a Goose session can pick it up later (see
// the product-design-annotate skill for the processing workflow).
//
// CRITICAL DIFFERENCE FROM THE VITE VERSION: Vite's `configureServer` hook
// only registers the middleware for `vite dev` — it is structurally absent
// from a production build. A Next.js Route Handler has no such automatic
// exclusion; it ships in `next build` unless explicitly guarded. This file
// guards itself at request time (503 outside development) AND should only
// ever be installed under a route segment, so it is straightforward to
// delete entirely before a production deploy if you prefer belt-and-braces
// removal over trusting the runtime guard alone.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 2_000_000; // annotations are small JSON only

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    // Mirrors the Vite plugin never being registered outside `vite dev`.
    return NextResponse.json(
      { ok: false, error: "Annotation intake is dev-only" },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 });
  }

  let record: Record<string, unknown>;
  try {
    record = await request.json();
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }

  record.receivedAt = new Date().toISOString();

  const inboxDir = path.join(process.cwd(), ".goose", "annotations", "inbox");
  await mkdir(inboxDir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
  await writeFile(path.join(inboxDir, filename), JSON.stringify(record, null, 2), "utf8");

  return NextResponse.json({ ok: true, filename });
}
