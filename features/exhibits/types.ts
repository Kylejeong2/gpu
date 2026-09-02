export const EXHIBIT_IDS = ["h100", "b200", "gb300", "nvl72"] as const;
export type ExhibitId = (typeof EXHIBIT_IDS)[number];

export type PartId =
  | "cuda-architecture"
  | "gpu-ram"
  | "gpc"
  | "sm"
  | "tensor-core"
  | "cuda-core"
  | "tma"
  | "tensor-memory"
  | "tpc"
  | "sm-architecture"
  | "warp-scheduler"
  | "register-file"
  | "core"
  | "special-function-unit"
  | "load-store-unit"
  | "l1-data-cache"
  | "gpu"
  | "grace-cpu"
  | "lpddr5x"
  | "nvlink"
  | "nvlink-c2c"
  | "compute-tray"
  | "switch-tray"
  | "nvlink-spine"
  | "power-shelf"
  | "cooling-manifold"
  | "nvlink-switch";

export type ModelView = "exterior" | "architecture";
export type Vec3 = readonly [x: number, y: number, z: number];

export type ReferenceUrl = `https://modal.com/gpu-glossary/${string}` | `https://www.nvidia.com/${string}`;

export type PartDefinition = Readonly<{
  id: PartId;
  index: string;
  title: string;
  abbreviation?: string;
  description: string;
  referenceUrl: ReferenceUrl;
  view: ModelView;
  anchor: Vec3;
}>;

export type CameraPreset = Readonly<{
  position: Vec3;
  target: Vec3;
  minDistance: number;
  maxDistance: number;
}>;

export type Exhibit = Readonly<{
  id: ExhibitId;
  name: string;
  href: string;
  stagePath: string;
  exteriorLabel: string;
  description: string;
  camera: CameraPreset;
  explodable?: boolean;
  parts: readonly PartDefinition[];
}>;

export const BOARD_CAMERA: CameraPreset = {
  position: [9.2, 6.5, 9.6],
  target: [0, 0.35, 0],
  minDistance: 6.8,
  maxDistance: 24,
};

export function getPart(exhibit: Exhibit, id: PartId): PartDefinition {
  const part = exhibit.parts.find((candidate) => candidate.id === id);
  if (!part) throw new Error(`Exhibit "${exhibit.id}" has no part "${id}"`);
  return part;
}

export function getReferenceLabel(url: ReferenceUrl): string {
  return url.startsWith("https://modal.com/") ? "OPEN GLOSSARY" : "OPEN NVIDIA DOCS";
}
