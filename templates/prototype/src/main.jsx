import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

// Dev-only Product Design annotation overlay. Never included in production
// builds: import.meta.env.DEV is statically replaced by Vite, so the
// import and render are dropped entirely from `vite build` output.
const AnnotationOverlay = import.meta.env.DEV
  ? (await import("./annotate/AnnotationOverlay.jsx")).AnnotationOverlay
  : null;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    {AnnotationOverlay && <AnnotationOverlay />}
  </React.StrictMode>,
);
