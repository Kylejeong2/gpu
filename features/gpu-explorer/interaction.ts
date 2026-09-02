import type { ModelView, PartId, Vec3 } from "@/features/exhibits";

export type ExplorerState = Readonly<{
  hoveredPartId: PartId | null;
  previewPoint: Vec3 | null;
  selectedPartId: PartId | null;
  view: ModelView;
  exploded: boolean;
  userHasInteracted: boolean;
}>;

export type ExplorerAction =
  | { readonly kind: "preview"; readonly partId: PartId; readonly point?: Vec3 }
  | { readonly kind: "clear-preview" }
  | { readonly kind: "select"; readonly partId: PartId; readonly view: ModelView }
  | { readonly kind: "clear-selection" }
  | { readonly kind: "set-view"; readonly view: ModelView }
  | { readonly kind: "set-exploded"; readonly exploded: boolean }
  | { readonly kind: "interacted" };

export const INITIAL_EXPLORER_STATE: ExplorerState = {
  hoveredPartId: null,
  previewPoint: null,
  selectedPartId: null,
  view: "exterior",
  exploded: false,
  userHasInteracted: false,
};

export function reduceExplorerState(state: ExplorerState, action: ExplorerAction): ExplorerState {
  switch (action.kind) {
    case "preview":
      return { ...state, hoveredPartId: action.partId, previewPoint: action.point ?? null };
    case "clear-preview":
      return { ...state, hoveredPartId: null, previewPoint: null };
    case "select":
      return {
        ...state,
        hoveredPartId: null,
        previewPoint: null,
        selectedPartId: action.partId,
        view: action.view,
        userHasInteracted: true,
      };
    case "clear-selection":
      return { ...state, selectedPartId: null };
    case "set-view":
      return {
        ...state,
        hoveredPartId: null,
        previewPoint: null,
        selectedPartId: null,
        view: action.view,
        userHasInteracted: true,
      };
    case "set-exploded":
      return state.exploded === action.exploded
        ? state
        : { ...state, hoveredPartId: null, previewPoint: null, selectedPartId: null, exploded: action.exploded, userHasInteracted: true };
    case "interacted":
      return state.userHasInteracted ? state : { ...state, userHasInteracted: true };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

export function getVisiblePartId(state: ExplorerState): PartId | null {
  return state.hoveredPartId ?? state.selectedPartId;
}

export function getPreviewPoint(state: ExplorerState): Vec3 | null {
  return state.hoveredPartId ? state.previewPoint : null;
}

export type PointerPoint = Readonly<{ x: number; y: number }>;

export function isActivationGesture({
  origin,
  release,
  threshold = 7,
}: Readonly<{ origin: PointerPoint; release: PointerPoint; threshold?: number }>): boolean {
  return Math.hypot(release.x - origin.x, release.y - origin.y) <= threshold;
}
