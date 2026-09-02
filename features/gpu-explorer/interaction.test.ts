import { describe, expect, it } from "vitest";
import { INITIAL_EXPLORER_STATE, getPreviewPoint, getVisiblePartId, isActivationGesture, reduceExplorerState } from "./interaction";

describe("explorer state", () => {
  it("lets an ephemeral preview take precedence over a pinned selection", () => {
    const selected = reduceExplorerState(INITIAL_EXPLORER_STATE, {
      kind: "select",
      partId: "gpu-ram",
      view: "exterior",
    });
    const previewed = reduceExplorerState(selected, {
      kind: "preview",
      partId: "tensor-core",
    });

    expect(getVisiblePartId(previewed)).toBe("tensor-core");
    expect(getVisiblePartId(reduceExplorerState(previewed, { kind: "clear-preview" }))).toBe("gpu-ram");
  });

  it("switches to the view required by the selected part", () => {
    const state = reduceExplorerState(INITIAL_EXPLORER_STATE, {
      kind: "select",
      partId: "sm",
      view: "architecture",
    });

    expect(state.view).toBe("architecture");
    expect(state.userHasInteracted).toBe(true);
  });

  it("keeps the chosen view when previewing a part from another view", () => {
    const architecture = reduceExplorerState(INITIAL_EXPLORER_STATE, {
      kind: "set-view",
      view: "architecture",
    });
    const previewed = reduceExplorerState(architecture, {
      kind: "preview",
      partId: "gpu-ram",
    });

    expect(previewed.view).toBe("architecture");
    expect(previewed.hoveredPartId).toBe("gpu-ram");
  });
});

describe("preview anchoring", () => {
  it("keeps the 3D pointer location while a part is previewed and drops it when the preview clears", () => {
    const previewed = reduceExplorerState(INITIAL_EXPLORER_STATE, {
      kind: "preview",
      partId: "tensor-core",
      point: [1, 2, 3],
    });

    expect(getPreviewPoint(previewed)).toEqual([1, 2, 3]);
    expect(getPreviewPoint(reduceExplorerState(previewed, { kind: "clear-preview" }))).toBeNull();
  });

  it("falls back to the static anchor when a rail hover has no pointer location", () => {
    const previewed = reduceExplorerState(INITIAL_EXPLORER_STATE, { kind: "preview", partId: "gpu-ram" });
    expect(getPreviewPoint(previewed)).toBeNull();
  });
});

describe("explode mode", () => {
  it("clears hover and selection when the rack explodes and survives a view change", () => {
    const selected = reduceExplorerState(INITIAL_EXPLORER_STATE, { kind: "select", partId: "compute-tray", view: "exterior" });
    const exploded = reduceExplorerState(selected, { kind: "set-exploded", exploded: true });
    const architecture = reduceExplorerState(exploded, { kind: "set-view", view: "architecture" });

    expect(exploded.selectedPartId).toBeNull();
    expect(exploded.exploded).toBe(true);
    expect(architecture.exploded).toBe(true);
  });

  it("returns the same state when explode is set to its current value", () => {
    expect(reduceExplorerState(INITIAL_EXPLORER_STATE, { kind: "set-exploded", exploded: false })).toBe(INITIAL_EXPLORER_STATE);
  });
});

describe("gesture arbitration", () => {
  it("accepts a short press as activation", () => {
    expect(isActivationGesture({ origin: { x: 20, y: 20 }, release: { x: 24, y: 23 } })).toBe(true);
  });

  it("rejects a drag as activation", () => {
    expect(isActivationGesture({ origin: { x: 20, y: 20 }, release: { x: 38, y: 31 } })).toBe(false);
  });
});
