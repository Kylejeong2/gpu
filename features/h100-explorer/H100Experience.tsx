"use client";

import dynamic from "next/dynamic";
import { useEffect, useReducer, useState } from "react";
import { getPartDefinition, getPartDefinitions, type ModelView, type PartId } from "@/features/exhibits/h100";
import { INITIAL_EXPLORER_STATE, getVisiblePartId, reduceExplorerState } from "./interaction";

const SceneViewport = dynamic(() => import("./SceneViewport").then((module) => module.SceneViewport), {
  ssr: false,
  loading: () => <div className="scene-fallback">INITIALIZING GPU MODEL_</div>,
});

export function H100Experience() {
  const [state, dispatch] = useReducer(reduceExplorerState, INITIAL_EXPLORER_STATE);
  const [helpOpen, setHelpOpen] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const parts = getPartDefinitions();
  const visiblePartId = getVisiblePartId(state);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      dispatch({ kind: "clear-preview" });
      dispatch({ kind: "clear-selection" });
      setHelpOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function previewPart(partId: PartId) {
    dispatch({ kind: "preview", partId });
  }

  function selectPart(partId: PartId) {
    const part = getPartDefinition(partId);
    dispatch({ kind: "select", partId, view: part.view });
  }

  function activatePart(partId: PartId) {
    selectPart(partId);
    if (window.matchMedia("(pointer: fine)").matches) {
      window.open(getPartDefinition(partId).glossaryUrl, "_blank", "noopener,noreferrer");
    }
  }

  function setView(view: ModelView) {
    dispatch({ kind: "set-view", view });
  }

  function resetView() {
    dispatch({ kind: "set-view", view: "exterior" });
    setResetToken((token) => token + 1);
  }

  return (
    <main className="page-frame">
      <div className="terminal-shell">
        <header className="site-header">
          <div className="brand-lockup" aria-label="H100 GPU Glossary">
            <strong>H100</strong>
            <span>GPU Glossary</span>
          </div>

          <div className="header-title" aria-hidden="true">
            H100 / ARCHITECTURE
          </div>

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
              <span>{parts.length.toString().padStart(2, "0")} PARTS</span>
            </div>
            <nav className="part-list">
              {parts.map((part) => (
                <a
                  key={part.id}
                  href={part.glossaryUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-active={visiblePartId === part.id}
                  onMouseEnter={() => previewPart(part.id)}
                  onMouseLeave={() => dispatch({ kind: "clear-preview" })}
                  onFocus={() => previewPart(part.id)}
                  onBlur={() => dispatch({ kind: "clear-preview" })}
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

          <section className="scene-stage" aria-label="Interactive 3D model of an H100 GPU">
            <h1 className="sr-only">Interactive NVIDIA H100 GPU architecture glossary</h1>
            <div className="stage-path">/device-hardware/h100-sxm</div>
            <div className="view-label">
              <span>{state.view === "exterior" ? "H100 SXM5 MODULE" : "ILLUSTRATIVE ARCHITECTURE VIEW"}</span>
              <i aria-hidden="true" />
            </div>

            <SceneViewport
              activePartId={visiblePartId}
              view={state.view}
              userHasInteracted={state.userHasInteracted}
              resetToken={resetToken}
              onPreview={previewPart}
              onClearPreview={() => dispatch({ kind: "clear-preview" })}
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
                <p>Desktop component clicks open Modal. Touch taps pin a card first.</p>
              </div>
            ) : null}

            <div className="stage-status" aria-live="polite">
              <span className="status-dot" />
              {visiblePartId ? getPartDefinition(visiblePartId).title.toUpperCase() : "MODEL READY"}
            </div>
            <div className="stage-hint">{state.userHasInteracted ? "ESC TO CLEAR" : "DRAG TO BEGIN"}</div>
          </section>
        </div>

        <nav className="mobile-part-bar" aria-label="GPU component shortcuts">
          {parts.map((part) => (
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
