import type { BoardPoint } from "./modelPrimitives";

export type SlotKind = "compute" | "switch" | "power" | "tor" | "blank";
export type RackSlot = Readonly<{ kind: SlotKind; u: number; index: number; y: number }>;

// Scene units are derived from the published 48U MGX rack: 600 mm wide,
// 2294 mm tall, 1068 mm deep. Width is pinned to 2.5 units.
const MM = 2.5 / 600;
const UNIT_HEIGHT = 44.45 * MM;
const RACK_HEIGHT = 2294 * MM;
const RACK_DEPTH = 1068 * MM;
const FLOOR_Y = -0.5;
const PLINTH = 0.4;
const TOP_CAP = RACK_HEIGHT - PLINTH - 48 * UNIT_HEIGHT;

// Rack elevation, top down. NVIDIA's DGX GB200 SuperPOD reference architecture
// and Lenovo's GB300 NVL72 product guide both show the same block order, and
// NVIDIA Mission Control publishes the U positions used here. Absolute U indices
// vary by one between two NVIDIA pages; the block order is consistent everywhere.
const OCCUPIED: Readonly<Record<number, SlotKind>> = {
  45: "tor",
  44: "tor",
  42: "power",
  41: "power",
  40: "power",
  39: "power",
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [28 + i, "compute" as const])),
  ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [19 + i, "switch" as const])),
  ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [11 + i, "compute" as const])),
  9: "power",
  8: "power",
  7: "power",
  6: "power",
};

function uCenterY(u: number): number {
  return FLOOR_Y + PLINTH + (u - 0.5) * UNIT_HEIGHT;
}

function buildSlots(): readonly RackSlot[] {
  const slots: RackSlot[] = [];
  let index = 0;
  for (let u = 48; u >= 1; u -= 1) {
    slots.push({ kind: OCCUPIED[u] ?? "blank", u, index: index++, y: uCenterY(u) });
  }
  return slots;
}

const SLOTS = buildSlots();
const FABRIC = SLOTS.filter((slot) => slot.kind === "compute" || slot.kind === "switch");

const TRAY_WIDTH = 438 * MM;
const TRAY_DEPTH = 766 * MM;
const TRAY_FRONT_Z = RACK_DEPTH / 2 - 0.22;

// Front to rear a compute tray runs: front I/O and drive bays, an air-cooled
// bay of OSFP and ConnectX cards, the fan wall, then the two NVL2 boards.
// On each board the Grace CPU sits forward of its two GPUs.
const BOARD_XS = [-0.45, 0.45] as const;
const GPU_DX = [-0.21, 0.21] as const;
const CPU_Z = 0.35;
const GPU_Z = -0.7;
const SWITCH_CHIP_XS = [-0.42, 0.42] as const;

export type Superchip = Readonly<{ cpu: BoardPoint; gpus: readonly BoardPoint[] }>;

export const NVL72_GEOMETRY = {
  floorY: FLOOR_Y,
  unitHeight: UNIT_HEIGHT,
  plinthHeight: PLINTH,
  topCapHeight: TOP_CAP,
  rackSize: [2.5, RACK_HEIGHT, RACK_DEPTH] as const,
  rackUnits: 48,
  traySize: [TRAY_WIDTH, UNIT_HEIGHT * 0.86, TRAY_DEPTH] as const,
  trayFrontZ: TRAY_FRONT_Z,
  slots: SLOTS,
  fanWallZ: 0.78,
  fansPerTray: 8,
  gpusPerComputeTray: 4,
  cpusPerComputeTray: 2,
  switchChipsPerTray: 2,
  psusPerShelf: 6,
  computeBaysPerTray: 8,
  switchPortCagesPerTray: 5,
  chipSize: [0.36, 0.11, 0.36] as const,
  switchChipSize: [0.44, 0.11, 0.44] as const,
  superchips: BOARD_XS.map((x) => ({
    cpu: [x, CPU_Z] as BoardPoint,
    gpus: GPU_DX.map((dx) => [x + dx, GPU_Z] as BoardPoint),
  })) as readonly Superchip[],
  switchChips: SWITCH_CHIP_XS.map((x) => [x, -0.9] as BoardPoint),
  // Four cable cartridges stand vertically at the rear, spanning exactly the
  // 27U of compute and switch trays and carrying over 5,000 copper cables.
  cartridges: {
    count: 4,
    z: -RACK_DEPTH / 2 + 0.3,
    width: TRAY_WIDTH * 0.92,
    top: FABRIC[0].y + UNIT_HEIGHT / 2,
    bottom: FABRIC[FABRIC.length - 1].y - UNIT_HEIGHT / 2,
  },
  // Single 1400 A busbar, middle rear, behind the cartridge plane.
  busbar: { z: -RACK_DEPTH / 2 + 0.12, width: 0.16 },
  // Two manifolds at the rear, return on the rack's left and supply on its right.
  manifolds: [
    { x: -0.86, z: -RACK_DEPTH / 2 + 0.5, role: "return" },
    { x: 0.86, z: -RACK_DEPTH / 2 + 0.5, role: "supply" },
  ] as const,
} as const;

export function countSlots(kind: SlotKind): number {
  return SLOTS.filter((slot) => slot.kind === kind).length;
}

export function slotsOfKind(kind: SlotKind): readonly RackSlot[] {
  return SLOTS.filter((slot) => slot.kind === kind);
}
