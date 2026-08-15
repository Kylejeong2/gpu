import type { ModelView, PartId } from "@/features/exhibits/h100";

export type ExplorerState = Readonly<{
  hoveredPartId: PartId | null;
  selectedPartId: PartId | null;
  view: ModelView;
  userHasInteracted: boolean;
}>;

export type ExplorerAction =
  | { readonly kind: "preview"; readonly partId: PartId }
  | { readonly kind: "clear-preview" }
  | { readonly kind: "select"; readonly partId: PartId; readonly view: ModelView }
  | { readonly kind: "clear-selection" }
  | { readonly kind: "set-view"; readonly view: ModelView }
  | { readonly kind: "interacted" };

export const INITIAL_EXPLORER_STATE: ExplorerState = {
  hoveredPartId: null,
  selectedPartId: null,
  view: "exterior",
  userHasInteracted: false,
};

export function reduceExplorerState(state: ExplorerState, action: ExplorerAction): ExplorerState {
  switch (action.kind) {
    case "preview":
      return { ...state, hoveredPartId: action.partId };
    case "clear-preview":
      return { ...state, hoveredPartId: null };
    case "select":
      return {
        ...state,
        hoveredPartId: null,
        selectedPartId: action.partId,
        view: action.view,
        userHasInteracted: true,
      };
    case "clear-selection":
      return { ...state, selectedPartId: null };
    case "set-view":
      return { ...state, hoveredPartId: null, selectedPartId: null, view: action.view, userHasInteracted: true };
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

export type PointerPoint = Readonly<{ x: number; y: number }>;

export function isActivationGesture({
  origin,
  release,
  threshold = 7,
}: Readonly<{ origin: PointerPoint; release: PointerPoint; threshold?: number }>): boolean {
  return Math.hypot(release.x - origin.x, release.y - origin.y) <= threshold;
}
