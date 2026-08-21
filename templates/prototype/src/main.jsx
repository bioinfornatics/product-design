import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

const AnnotationOverlay = import.meta.env.DEV
  ? lazy(() => import("./annotate/AnnotationOverlay.jsx").then(({ AnnotationOverlay }) => ({ default: AnnotationOverlay })))
  : null;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    {AnnotationOverlay && (
      <Suspense fallback={null}>
        <AnnotationOverlay />
      </Suspense>
    )}
  </React.StrictMode>,
);
