"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import { EXHIBITS, EXHIBIT_TABS, getPart, type ExhibitId, type ModelView, type PartId, type Vec3 } from "@/features/exhibits";
import { INITIAL_EXPLORER_STATE, getPreviewPoint, getVisiblePartId, reduceExplorerState } from "./interaction";

const PREVIEW_LINGER_MS = 160;

const SceneViewport = dynamic(() => import("./SceneViewport").then((module) => module.SceneViewport), {
  ssr: false,
  loading: () => <div className="scene-fallback">INITIALIZING GPU MODEL_</div>,
});

export function GpuExperience({ exhibitId }: Readonly<{ exhibitId: ExhibitId }>) {
  const exhibit = EXHIBITS[exhibitId];
  const [state, dispatch] = useReducer(reduceExplorerState, INITIAL_EXPLORER_STATE);
  const [helpOpen, setHelpOpen] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const visiblePartId = getVisiblePartId(state);
  const pendingClear = useRef<number | null>(null);

  function cancelPendingClear() {
    if (pendingClear.current === null) return;
    window.clearTimeout(pendingClear.current);
    pendingClear.current = null;
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      cancelPendingClear();
      dispatch({ kind: "clear-preview" });
      dispatch({ kind: "clear-selection" });
      setHelpOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      cancelPendingClear();
    };
  }, []);

  function previewPart(partId: PartId, point?: Vec3) {
    cancelPendingClear();
    dispatch({ kind: "preview", partId, point });
  }

  function clearPreviewSoon() {
    cancelPendingClear();
    pendingClear.current = window.setTimeout(() => {
      pendingClear.current = null;
      dispatch({ kind: "clear-preview" });
    }, PREVIEW_LINGER_MS);
  }

  function selectPart(partId: PartId) {
    dispatch({ kind: "select", partId, view: getPart(exhibit, partId).view });
  }

  function activatePart(partId: PartId) {
    selectPart(partId);
    if (window.matchMedia("(pointer: fine)").matches) {
      window.open(getPart(exhibit, partId).referenceUrl, "_blank", "noopener,noreferrer");
    }
  }

  function setView(view: ModelView) {
    dispatch({ kind: "set-view", view });
  }

  function resetView() {
    dispatch({ kind: "set-exploded", exploded: false });
    dispatch({ kind: "set-view", view: "exterior" });
    setResetToken((token) => token + 1);
  }

  return (
    <main className="page-frame">
      <div className="terminal-shell">
        <header className="site-header">
          <div className="brand-lockup" aria-label={`${exhibit.name} GPU Glossary`}>
            <strong>{exhibit.name}</strong>
            <span>GPU Glossary</span>
          </div>

          <nav className="gpu-tabs" aria-label="Hardware exhibits">
            {EXHIBIT_TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                data-active={tab.id === exhibit.id}
                aria-current={tab.id === exhibit.id ? "page" : undefined}
              >
                {tab.name}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <div className="view-switch" aria-label="Model view">
              <button
                type="button"
                aria-label="Show exterior view"
                data-active={state.view === "exterior"}
                onClick={() => setView("exterior")}
              >
                Exterior
              </button>
              <button
                type="button"
                aria-label="Show architecture view"
                data-active={state.view === "architecture"}
                onClick={() => setView("architecture")}
              >
                Architecture
              </button>
            </div>
            {exhibit.explodable ? (
              <button
                type="button"
                className="explode-control"
                aria-pressed={state.exploded}
                data-active={state.exploded}
                onClick={() => dispatch({ kind: "set-exploded", exploded: !state.exploded })}
              >
                {state.exploded ? "Assemble" : "Explode"}
              </button>
            ) : null}
            <button type="button" className="text-control" onClick={resetView}>
              Reset view
            </button>
            <button
              type="button"
              className="help-button"
              aria-label="Toggle controls help"
              aria-expanded={helpOpen}
              onClick={() => setHelpOpen((open) => !open)}
            >
              ?
            </button>
          </div>
        </header>

        <div className="explorer-grid">
          <aside className="part-rail" aria-label="GPU components">
            <div className="rail-heading">
              <span>COMPONENT INDEX</span>
              <span>{exhibit.parts.length.toString().padStart(2, "0")} PARTS</span>
            </div>
            <nav className="part-list">
              {exhibit.parts.map((part) => (
                <a
                  key={part.id}
                  href={part.referenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-active={visiblePartId === part.id}
                  onMouseEnter={() => previewPart(part.id)}
                  onMouseLeave={clearPreviewSoon}
                  onFocus={() => previewPart(part.id)}
                  onBlur={clearPreviewSoon}
                  onClick={() => selectPart(part.id)}
                >
                  <span className="part-index">{part.index}</span>
                  <span>{part.title}</span>
                  {part.abbreviation ? <small>{part.abbreviation}</small> : null}
                </a>
              ))}
            </nav>
            <div className="rail-footer">
              <span>DRAG TO ROTATE</span>
              <span>SCROLL TO ZOOM</span>
              <span>HOVER TO INSPECT</span>
            </div>
          </aside>

          <section className="scene-stage" aria-label={`Interactive 3D model of the NVIDIA ${exhibit.name} GPU`}>
            <h1 className="sr-only">Interactive NVIDIA {exhibit.name} GPU architecture glossary</h1>
            <div className="stage-path">{exhibit.stagePath}</div>
            <div className="view-label">
              <span>
                {state.view === "exterior" ? exhibit.exteriorLabel : "ILLUSTRATIVE ARCHITECTURE VIEW"}
              </span>
              <i aria-hidden="true" />
            </div>

            <SceneViewport
              exhibit={exhibit}
              activePartId={visiblePartId}
              previewPoint={getPreviewPoint(state)}
              view={state.view}
              exploded={state.exploded}
              userHasInteracted={state.userHasInteracted}
              resetToken={resetToken}
              onPreview={previewPart}
              onClearPreview={clearPreviewSoon}
              onActivate={activatePart}
              onSelect={selectPart}
              onInteract={() => dispatch({ kind: "interacted" })}
            />

            {helpOpen ? (
              <div className="help-panel" role="dialog" aria-label="3D controls">
                <button type="button" aria-label="Close help" onClick={() => setHelpOpen(false)}>
                  ×
                </button>
                <span>CONTROLS</span>
                <p>Drag to rotate. Scroll or pinch to zoom. Hover a component to inspect it.</p>
                {exhibit.explodable ? <p>Explode lifts every tray out of the rack so you can orbit the pieces and hover what is inside.</p> : null}
                <p>Desktop component clicks open the linked reference. Touch taps pin a card first.</p>
              </div>
            ) : null}

            <div className="stage-status" aria-live="polite">
              <span className="status-dot" />
              {visiblePartId ? getPart(exhibit, visiblePartId).title.toUpperCase() : "MODEL READY"}
            </div>
            <div className="stage-hint">
              {state.exploded ? "EXPLODED · ORBIT THE PIECES" : state.userHasInteracted ? "ESC TO CLEAR" : "DRAG TO BEGIN"}
            </div>
          </section>
        </div>

        <nav className="mobile-part-bar" aria-label="Component shortcuts">
          {exhibit.parts.map((part) => (
            <button
              key={part.id}
              type="button"
              data-active={visiblePartId === part.id}
              onClick={() => selectPart(part.id)}
            >
              {part.index} {part.abbreviation ?? part.title}
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
