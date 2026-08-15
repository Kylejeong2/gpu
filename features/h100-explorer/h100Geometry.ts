export type BoardPoint = readonly [x: number, z: number];
export type PackageSite = Readonly<{ position: BoardPoint; kind: "memory" | "structural" }>;

function grid(xs: readonly number[], zs: readonly number[]): readonly BoardPoint[] {
  return zs.flatMap((z) => xs.map((x) => [x, z] as const));
}

export const H100_SXM5_GEOMETRY = {
  boardSize: [8.6, 0.22, 4] as const,
  packageSize: [2.78, 0.34, 2.72] as const,
  dieSize: [1.42, 0.1, 1.18] as const,
  packageSites: [
    { position: [-0.84, -0.72], kind: "memory" },
    { position: [0, -0.72], kind: "memory" },
    { position: [0.84, -0.72], kind: "memory" },
    { position: [-0.84, 0.72], kind: "memory" },
    { position: [0, 0.72], kind: "memory" },
    { position: [0.84, 0.72], kind: "structural" },
  ] as const satisfies readonly PackageSite[],
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
  leftPowerStages: grid([-3.88, -3.52, -3.16], [-1.38, -0.92, -0.46, 0, 0.46, 0.92, 1.38]),
  rightPowerStages: grid([2.7, 3.08, 3.46, 3.84], [-1.1, -0.64, -0.18, 0.28, 0.74, 1.2]),
  topClampPositions: [-1.65, -0.56, 0.56, 1.65] as const,
  sideContacts: [-1.54, -1.26, -0.98, -0.7, -0.42, -0.14, 0.14, 0.42, 0.7, 0.98, 1.26, 1.54] as const,
  dieTileColumns: 12,
  dieTileRows: 9,
} as const;
