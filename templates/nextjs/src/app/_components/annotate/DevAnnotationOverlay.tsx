"use client";

import dynamic from "next/dynamic";

// Dev-only mount point for the Product Design annotation overlay, mirroring
// product-design's Vite template pattern:
//
//   const AnnotationOverlay = import.meta.env.DEV
//     ? (await import("./annotate/AnnotationOverlay.jsx")).AnnotationOverlay
//     : null;
//
// Vite statically replaces `import.meta.env.DEV` and drops the whole branch
// (including the dynamic import) from the production bundle. Next.js does
// the same static replacement for `process.env.NODE_ENV` via webpack's
// DefinePlugin + minifier dead-code elimination, so the `next/dynamic` import
// below is expected to be eliminated from the production client bundle too.
//
// This is best-effort parity, not a hard guarantee across every Next.js/
// bundler version. If you want zero-footprint certainty for a production
// deploy, delete this file, its `<DevAnnotationOverlay />` usage in the root
// layout, `AnnotationOverlay.tsx`, `annotate.css`, and the
// `api/goose-annotate/route.ts` handler entirely — the annotation overlay
// is a development aid, not a shipped product feature.
const AnnotationOverlay = dynamic(
  () => import("./AnnotationOverlay").then((mod) => mod.AnnotationOverlay),
  { ssr: false },
);

export function DevAnnotationOverlay() {
  if (process.env.NODE_ENV !== "development") return null;
  return <AnnotationOverlay />;
}
