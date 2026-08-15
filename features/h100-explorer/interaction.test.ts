import { describe, expect, it } from "vitest";
import { INITIAL_EXPLORER_STATE, getVisiblePartId, isActivationGesture, reduceExplorerState } from "./interaction";

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

describe("gesture arbitration", () => {
  it("accepts a short press as activation", () => {
    expect(isActivationGesture({ origin: { x: 20, y: 20 }, release: { x: 24, y: 23 } })).toBe(true);
  });

  it("rejects a drag as activation", () => {
    expect(isActivationGesture({ origin: { x: 20, y: 20 }, release: { x: 38, y: 31 } })).toBe(false);
  });
});
