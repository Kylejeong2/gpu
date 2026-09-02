import type { BoardPoint } from "./modelPrimitives";

function grid(xs: readonly number[], zs: readonly number[]): readonly BoardPoint[] {
  return zs.flatMap((z) => xs.map((x) => [x, z] as const));
}

export const GB300_GEOMETRY = {
  boardSize: [8.6, 0.22, 5.8] as const,
  gpuCenters: [
    [1.75, -1.45],
    [1.75, 1.45],
  ] as const satisfies readonly BoardPoint[],
  gpuScale: 0.85,
  graceCenter: [-2.35, 0] as const satisfies BoardPoint,
  gracePackageSize: [2.1, 0.34, 2.1] as const,
  graceDieSize: [1.3, 0.08, 1.3] as const,
  graceCoreColumns: 9,
  graceCoreRows: 8,
  lpddrSize: [0.62, 0.14, 1.05] as const,
  lpddrModules: grid([-3.5, -2.73, -1.96, -1.19], [-1.95, 1.95]),
  nvlinkConnectors: [
    [4.05, -1.45],
    [4.05, 1.45],
  ] as const satisfies readonly BoardPoint[],
  nvlinkConnectorSize: [0.28, 0.32, 1.7] as const,
  mountingHoles: [
    [-4.05, -2.55],
    [-4.05, 2.55],
    [3.55, -2.6],
    [3.55, 2.6],
  ] as const satisfies readonly BoardPoint[],
  powerStages: grid([-0.7, -0.35], [-2.3, -1.84, -1.38, -0.92, -0.46, 0, 0.46, 0.92, 1.38, 1.84, 2.3]),
} as const;
