// Dev-only annotation overlay for an Astro Product Design boilerplate.
// Install at src/components/AnnotationOverlay.tsx and mount as a
// client-only island: <AnnotationOverlay client:only="react" /> in the
// root layout (see the `annotate-inject` skill's Astro section). Requires
// the React integration (@astrojs/react) — if the target project uses a
// different UI framework for islands (Vue, Svelte, Solid), rewrite this
// component in that framework instead; the wire protocol (POST body shape)
// stays identical regardless of framework.
//
// Behavioral port of product-design's Vite AnnotationOverlay.jsx. Lets a
// non-technical reviewer drag a rectangle over any region of the running
// page, attach a short note, and send it to this app's own
// /api/goose-annotate route. A Goose session picks these up later (see the
// product-design-annotate skill). No screenshots are sent, only small JSON.
import { useCallback, useRef, useState } from "react";
import "./annotate.css";

type Bbox = { x: number; y: number; width: number; height: number };
type Drag = { startX: number; startY: number; x: number; y: number };
type Pending = { bbox: Bbox; components: string[] };
type Status = "idle" | "sending" | "sent" | "error";

const POPOVER_WIDTH = 260;
const POPOVER_HEIGHT = 190;
const POPOVER_MARGIN = 8;

function clampPopoverPosition(bbox: Bbox) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const fitsBelow =
    bbox.y + bbox.height + POPOVER_MARGIN + POPOVER_HEIGHT <= viewportHeight;
  const top = fitsBelow
    ? bbox.y + bbox.height + POPOVER_MARGIN
    : Math.max(POPOVER_MARGIN, bbox.y - POPOVER_HEIGHT - POPOVER_MARGIN);
  const maxLeft = Math.max(POPOVER_MARGIN, viewportWidth - POPOVER_WIDTH - POPOVER_MARGIN);
  const left = Math.min(Math.max(bbox.x, POPOVER_MARGIN), maxLeft);
  const maxTop = Math.max(POPOVER_MARGIN, viewportHeight - POPOVER_HEIGHT - POPOVER_MARGIN);
  const clampedTop = Math.min(Math.max(top, POPOVER_MARGIN), maxTop);
  return { left, top: clampedTop };
}

// Astro pages are largely static HTML with islands, not a single-page React
// tree — there is no React fiber to walk on the underlying elements outside
// the island itself. This port omits component-name guessing (unlike the
// Vite/React version); bbox/viewport/route are still enough for a Goose
// session to locate the right .astro/.tsx source by content and position.
function collectComponentGuesses(): string[] {
  return [];
}

export function AnnotationOverlay() {
  const [active, setActive] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!active) return;
      setDrag({ startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY });
    },
    [active],
  );

  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!active || !drag) return;
      setDrag((prev) => (prev ? { ...prev, x: event.clientX, y: event.clientY } : prev));
    },
    [active, drag],
  );

  const onMouseUp = useCallback(() => {
    if (!active || !drag) return;
    const x = Math.min(drag.startX, drag.x);
    const y = Math.min(drag.startY, drag.y);
    const width = Math.abs(drag.x - drag.startX);
    const height = Math.abs(drag.y - drag.startY);
    setDrag(null);
    if (width < 8 || height < 8) return;
    setPending({ bbox: { x, y, width, height }, components: collectComponentGuesses() });
  }, [active, drag]);

  const submit = useCallback(async () => {
    if (!pending) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/goose-annotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bbox: pending.bbox,
          viewport: { width: window.innerWidth, height: window.innerHeight },
          route: window.location.pathname + window.location.search,
          components: pending.components,
          note,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("sent");
      setTimeout(() => {
        setPending(null);
        setNote("");
        setStatus("idle");
      }, 900);
    } catch {
      setStatus("error");
    }
  }, [pending, note]);

  const cancel = useCallback(() => {
    setPending(null);
    setNote("");
    setStatus("idle");
  }, []);

  return (
    <>
      <button
        type="button"
        className={`goose-annotate-toggle${active ? " goose-annotate-toggle--active" : ""}`}
        onClick={() => setActive((prevActive) => !prevActive)}
      >
        {active ? "Exit Annotate" : "Annotate"}
      </button>

      {active && (
        <div
          ref={containerRef}
          className="goose-annotate-surface"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          {drag && (
            <div
              className="goose-annotate-rect"
              style={{
                left: Math.min(drag.startX, drag.x),
                top: Math.min(drag.startY, drag.y),
                width: Math.abs(drag.x - drag.startX),
                height: Math.abs(drag.y - drag.startY),
              }}
            />
          )}
        </div>
      )}

      {pending && (
        <div className="goose-annotate-popover" style={clampPopoverPosition(pending.bbox)}>
          <div className="goose-annotate-popover-title">Note for Goose</div>
          <textarea
            autoFocus
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What should change in this region?"
            rows={3}
          />
          <div className="goose-annotate-popover-actions">
            <button type="button" onClick={cancel} disabled={status === "sending"}>
              Cancel
            </button>
            <button
              type="button"
              className="goose-annotate-primary"
              onClick={submit}
              disabled={status === "sending" || note.trim().length === 0}
            >
              {status === "sending"
                ? "Sending\u2026"
                : status === "sent"
                  ? "Sent \u2713"
                  : status === "error"
                    ? "Retry"
                    : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
