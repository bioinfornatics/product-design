<!--
  Dev-only annotation overlay for a Nuxt Product Design boilerplate.
  Behavioral port of product-design's Vite AnnotationOverlay.jsx to Vue 3
  Composition API. Install at app/components/AnnotationOverlay.vue and mount
  it once, client-only, in app.vue (see the `annotate-inject` skill).

  Lets a non-technical reviewer drag a rectangle over any region of the
  running app, attach a short note, and send it to this app's own
  /api/goose-annotate route. A Goose session picks these up later (see the
  product-design-annotate skill). No screenshots are sent, only small JSON.
-->
<script setup lang="ts">
import { ref, reactive } from "vue";
import "./annotate.css";

type Bbox = { x: number; y: number; width: number; height: number };
type Drag = { startX: number; startY: number; x: number; y: number };
type Status = "idle" | "sending" | "sent" | "error";

const POPOVER_WIDTH = 260;
const POPOVER_HEIGHT = 190;
const POPOVER_MARGIN = 8;

const active = ref(false);
const drag = ref<Drag | null>(null);
const pending = ref<{ bbox: Bbox; components: string[] } | null>(null);
const note = ref("");
const status = ref<Status>("idle");

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
  return { left: `${left}px`, top: `${clampedTop}px` };
}

// Vue's fiber-equivalent is the component instance graph, not a global DOM
// property like React's __reactFiber$ key. There is no stable, public API to
// walk from a DOM node back to the owning Nuxt/Vue component instance in
// production builds. This port intentionally omits component-name guessing:
// the annotation still carries bbox/viewport/route, which is enough for a
// Goose session to locate the right template/component by content match.
function collectComponentGuesses(): string[] {
  return [];
}

function onMouseDown(event: MouseEvent) {
  if (!active.value) return;
  drag.value = { startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY };
}

function onMouseMove(event: MouseEvent) {
  if (!active.value || !drag.value) return;
  drag.value = { ...drag.value, x: event.clientX, y: event.clientY };
}

function onMouseUp() {
  if (!active.value || !drag.value) return;
  const d = drag.value;
  const x = Math.min(d.startX, d.x);
  const y = Math.min(d.startY, d.y);
  const width = Math.abs(d.x - d.startX);
  const height = Math.abs(d.y - d.startY);
  drag.value = null;
  if (width < 8 || height < 8) return;
  pending.value = { bbox: { x, y, width, height }, components: collectComponentGuesses() };
}

async function submit() {
  if (!pending.value) return;
  status.value = "sending";
  try {
    const res = await fetch("/api/goose-annotate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bbox: pending.value.bbox,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        route: window.location.pathname + window.location.search,
        components: pending.value.components,
        note: note.value,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    status.value = "sent";
    setTimeout(() => {
      pending.value = null;
      note.value = "";
      status.value = "idle";
    }, 900);
  } catch {
    status.value = "error";
  }
}

function cancel() {
  pending.value = null;
  note.value = "";
  status.value = "idle";
}
</script>

<template>
  <button
    type="button"
    class="goose-annotate-toggle"
    :class="{ 'goose-annotate-toggle--active': active }"
    @click="active = !active"
  >
    {{ active ? "Exit Annotate" : "Annotate" }}
  </button>

  <div
    v-if="active"
    class="goose-annotate-surface"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  >
    <div
      v-if="drag"
      class="goose-annotate-rect"
      :style="{
        left: `${Math.min(drag.startX, drag.x)}px`,
        top: `${Math.min(drag.startY, drag.y)}px`,
        width: `${Math.abs(drag.x - drag.startX)}px`,
        height: `${Math.abs(drag.y - drag.startY)}px`,
      }"
    />
  </div>

  <div v-if="pending" class="goose-annotate-popover" :style="clampPopoverPosition(pending.bbox)">
    <div class="goose-annotate-popover-title">Note for Goose</div>
    <textarea
      v-model="note"
      autofocus
      placeholder="What should change in this region?"
      rows="3"
    />
    <div class="goose-annotate-popover-actions">
      <button type="button" :disabled="status === 'sending'" @click="cancel">Cancel</button>
      <button
        type="button"
        class="goose-annotate-primary"
        :disabled="status === 'sending' || note.trim().length === 0"
        @click="submit"
      >
        {{ status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : status === "error" ? "Retry" : "Send" }}
      </button>
    </div>
  </div>
</template>
