import { B200_EXHIBIT } from "./b200";
import { GB300_EXHIBIT } from "./gb300";
import { H100_EXHIBIT } from "./h100";
import { NVL72_EXHIBIT } from "./nvl72";
import type { Exhibit, ExhibitId } from "./types";

export const EXHIBITS: Readonly<Record<ExhibitId, Exhibit>> = {
  h100: H100_EXHIBIT,
  b200: B200_EXHIBIT,
  gb300: GB300_EXHIBIT,
  nvl72: NVL72_EXHIBIT,
};

export const EXHIBIT_TABS: readonly Exhibit[] = [H100_EXHIBIT, B200_EXHIBIT, GB300_EXHIBIT, NVL72_EXHIBIT];

export { getPart, getReferenceLabel } from "./types";
export type { CameraPreset, Exhibit, ExhibitId, ModelView, PartDefinition, PartId, Vec3 } from "./types";
