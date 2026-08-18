import React, { useCallback, useRef, useState } from "react";
import "./annotate.css";

// Dev-only annotation overlay for Product Design prototypes.
//
// Lets a non-technical reviewer drag a rectangle over any region of the
// running prototype, attach a short note, and send it to the local Vite dev
// server (/__goose-annotate). A Goose session picks these up later via the
// `annotate` skill: it screenshots the same route/viewport,
// crops to the recorded bbox, and uses the collected component-name guesses
// to jump straight to the right source file.
//
// This component intentionally sends NO images/screenshots itself — just
// small JSON — so annotating stays instant and payload-light. Screenshot
// capture happens on the Goose side, at a controlled/downscaled size.

// Estimated popover footprint; matches annotate.css. Used only to keep the
// popover fully on-screen — exact pixel match isn't required.
const POPOVER_WIDTH = 260;
const POPOVER_HEIGHT = 190;
const POPOVER_MARGIN = 8;

function clampPopoverPosition(bbox) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Prefer below the selection; flip above if there isn't room.
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

function collectComponentGuesses(x, y) {
  const points = [
    [x, y],
    [x - 4, y - 4],
    [x + 4, y - 4],
    [x - 4, y + 4],
    [x + 4, y + 4],
  ];

  const names = [];
  const seen = new Set();

  // The overlay's own full-screen surface sits above the app and would
  // otherwise be the only thing elementFromPoint ever finds. Hide overlay
  // elements from hit-testing while sampling so we see the real app below.
  const overlayNodes = document.querySelectorAll(
    ".goose-annotate-surface, .goose-annotate-rect, .goose-annotate-toggle, .goose-annotate-popover",
  );
  const previousPointerEvents = [];
  overlayNodes.forEach((node) => {
    previousPointerEvents.push([node, node.style.pointerEvents]);
    node.style.pointerEvents = "none";
  });

  for (const [px, py] of points) {
    const el = document.elementFromPoint(px, py);
    if (!el) continue;

    let node = el;
    let depth = 0;
    while (node && depth < 20) {
      const fiberKey = Object.keys(node).find(
        (key) =>
          key.startsWith("__reactFiber$") || key.startsWith("__reactInternalInstance$"),
      );
      if (fiberKey) {
        let fiber = node[fiberKey];
        let fiberDepth = 0;
        while (fiber && fiberDepth < 25) {
          const type = fiber.type;
          const name =
            (typeof type === "function" && (type.displayName || type.name)) ||
            (typeof type === "string" ? null : undefined);
          if (name && !seen.has(name)) {
            seen.add(name);
            names.push(name);
          }
          fiber = fiber.return;
          fiberDepth += 1;
        }
        break;
      }
      node = node.parentElement;
      depth += 1;
    }
  }

  previousPointerEvents.forEach(([node, value]) => {
    node.style.pointerEvents = value;
  });

  return names.slice(0, 8);
}

export function AnnotationOverlay() {
  const [active, setActive] = useState(false);
  const [drag, setDrag] = useState(null); // { startX, startY, x, y }
  const [pending, setPending] = useState(null); // { bbox, components }
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const containerRef = useRef(null);

  const onMouseDown = useCallback(
    (event) => {
      if (!active) return;
      setDrag({
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [active],
  );

  const onMouseMove = useCallback(
    (event) => {
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

    if (width < 8 || height < 8) return; // ignore accidental clicks

    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const components = collectComponentGuesses(centerX, centerY);

    setPending({
      bbox: { x, y, width, height },
      components,
    });
  }, [active, drag]);

  const submit = useCallback(async () => {
    if (!pending) return;
    setStatus("sending");
    try {
      const res = await fetch("/__goose-annotate", {
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
    } catch (error) {
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
        <div
          className="goose-annotate-popover"
          style={clampPopoverPosition(pending.bbox)}
        >
          <div className="goose-annotate-popover-title">Note for Goose</div>
          {pending.components.length > 0 && (
            <div className="goose-annotate-popover-components">
              {pending.components.slice(0, 3).join(" \u2039 ")}
            </div>
          )}
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
