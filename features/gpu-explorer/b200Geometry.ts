import type { BoardPoint } from "./modelPrimitives";

function grid(xs: readonly number[], zs: readonly number[]): readonly BoardPoint[] {
  return zs.flatMap((z) => xs.map((x) => [x, z] as const));
}

const HBM_COLUMN_OFFSETS = [1.2, 1.7] as const;
const HBM_ROW_OFFSETS = [-0.36, 0.36] as const;

export const B200_SXM6_GEOMETRY = {
  boardSize: [8.6, 0.22, 4] as const,
  packageSize: [4.06, 0.34, 2.72] as const,
  dieSize: [0.86, 0.08, 1.34] as const,
  dieCenters: [-0.46, 0.46] as const,
  bridgeSize: [0.06, 0.07, 1.22] as const,
  hbmSize: [0.44, 0.15, 0.62] as const,
  hbmStacks: grid(
    [...HBM_COLUMN_OFFSETS.map((x) => -x), ...HBM_COLUMN_OFFSETS],
    HBM_ROW_OFFSETS,
  ),
  mountingHoles: [
    [-2.72, -1.58],
    [-2.18, -1.58],
    [2.2, -1.58],
    [2.74, -1.58],
    [-2.72, 1.58],
    [-2.18, 1.58],
    [2.2, 1.58],
    [2.74, 1.58],
  ] as const satisfies readonly BoardPoint[],
  leftPowerStages: grid([-3.9, -3.55, -3.2], [-1.38, -0.92, -0.46, 0, 0.46, 0.92, 1.38]),
  rightPowerStages: grid([2.72, 3.1, 3.48, 3.86], [-1.1, -0.64, -0.18, 0.28, 0.74, 1.2]),
  topClampPositions: [-1.9, -0.64, 0.64, 1.9] as const,
  sideContacts: [-1.54, -1.26, -0.98, -0.7, -0.42, -0.14, 0.14, 0.42, 0.7, 0.98, 1.26, 1.54] as const,
  dieTileColumns: 7,
  dieTileRows: 11,
} as const;
