import type { BoardPoint } from "./modelPrimitives";

export type TrayKind = "compute" | "switch" | "power";
export type TraySlot = Readonly<{ kind: TrayKind; index: number; y: number }>;

const FLOOR_Y = -0.5;
const BASE_HEIGHT = 0.3;
const UNIT_HEIGHT = 0.21;

const LAYOUT_TOP_TO_BOTTOM: readonly Readonly<{ kind: TrayKind; count: number }>[] = [
  { kind: "power", count: 4 },
  { kind: "compute", count: 10 },
  { kind: "switch", count: 9 },
  { kind: "compute", count: 8 },
  { kind: "power", count: 4 },
];

const TOTAL_UNITS = LAYOUT_TOP_TO_BOTTOM.reduce((sum, section) => sum + section.count, 0);
const TRAY_TOP_Y = FLOOR_Y + BASE_HEIGHT + TOTAL_UNITS * UNIT_HEIGHT;

function expandLayout(): readonly TraySlot[] {
  const slots: TraySlot[] = [];
  let unitFromTop = 0;
  for (const section of LAYOUT_TOP_TO_BOTTOM) {
    for (let i = 0; i < section.count; i += 1) {
      slots.push({ kind: section.kind, index: unitFromTop, y: TRAY_TOP_Y - (unitFromTop + 0.5) * UNIT_HEIGHT });
      unitFromTop += 1;
    }
  }
  return slots;
}

const TRAY_SLOTS = expandLayout();
const NETWORK_SLOTS = TRAY_SLOTS.filter((slot) => slot.kind !== "power");

const SUPERCHIP_XS = [-0.56, 0.56] as const;
const GPU_DX = [-0.24, 0.24] as const;
const SWITCH_XS = [-0.5, 0.5] as const;

export type Superchip = Readonly<{ cpu: BoardPoint; gpus: readonly BoardPoint[] }>;

export const NVL72_GEOMETRY = {
  floorY: FLOOR_Y,
  unitHeight: UNIT_HEIGHT,
  rackSize: [2.5, TRAY_TOP_Y + BASE_HEIGHT - FLOOR_Y, 4.3] as const,
  baseHeight: BASE_HEIGHT,
  traySize: [2.1, 0.185, 3.4] as const,
  trayFrontZ: 2.05,
  traySlots: TRAY_SLOTS,
  spine: {
    x: 0,
    z: -1.68,
    top: NETWORK_SLOTS[0].y + UNIT_HEIGHT / 2,
    bottom: NETWORK_SLOTS[NETWORK_SLOTS.length - 1].y - UNIT_HEIGHT / 2,
    cableColumns: 16,
    cableLayers: 2,
    width: 1.9,
  },
  manifolds: [
    { x: 1.02, z: -1.95, role: "supply" },
    { x: -1.02, z: -1.95, role: "return" },
  ] as const,
  gpusPerComputeTray: 4,
  cpusPerComputeTray: 2,
  switchChipsPerTray: 2,
  psusPerShelf: 6,
  chipSize: [0.42, 0.12, 0.42] as const,
  switchChipSize: [0.56, 0.12, 0.56] as const,
  superchips: SUPERCHIP_XS.map((x) => ({
    cpu: [x, -0.4] as BoardPoint,
    gpus: GPU_DX.map((dx) => [x + dx, 0.72] as BoardPoint),
  })) as readonly Superchip[],
  switchChips: SWITCH_XS.map((x) => [x, 0.4] as BoardPoint),
} as const;

export function countTrays(kind: TrayKind): number {
  return NVL72_GEOMETRY.traySlots.filter((slot) => slot.kind === kind).length;
}
