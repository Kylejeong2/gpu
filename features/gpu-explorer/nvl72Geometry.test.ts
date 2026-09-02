import { describe, expect, it } from "vitest";
import { NVL72_GEOMETRY, countSlots, slotsOfKind } from "./nvl72Geometry";

describe("NVL72 rack elevation", () => {
  it("fills a 48U rack", () => {
    expect(NVL72_GEOMETRY.slots).toHaveLength(48);
    expect(NVL72_GEOMETRY.slots.map((slot) => slot.u)).toEqual(
      Array.from({ length: 48 }, (_, i) => 48 - i),
    );
  });

  it("holds 18 compute trays, 9 switch trays, 8 power shelves and 2 top-of-rack switches", () => {
    expect(countSlots("compute")).toBe(18);
    expect(countSlots("switch")).toBe(9);
    expect(countSlots("power")).toBe(8);
    expect(countSlots("tor")).toBe(2);
  });

  it("adds up to 72 GPUs and 36 Grace CPUs", () => {
    expect(countSlots("compute") * NVL72_GEOMETRY.gpusPerComputeTray).toBe(72);
    expect(countSlots("compute") * NVL72_GEOMETRY.cpusPerComputeTray).toBe(36);
    expect(countSlots("switch") * NVL72_GEOMETRY.switchChipsPerTray).toBe(18);
  });

  it("stacks the published block order from the top down", () => {
    // NVIDIA DGX GB200 SuperPOD reference architecture, figure 3.1, and the
    // Lenovo GB300 NVL72 product guide front view both show this order.
    const blocks: { kind: string; count: number }[] = [];
    for (const slot of NVL72_GEOMETRY.slots) {
      const last = blocks.at(-1);
      if (last && last.kind === slot.kind) last.count += 1;
      else blocks.push({ kind: slot.kind, count: 1 });
    }
    expect(blocks.filter((b) => b.kind !== "blank")).toEqual([
      { kind: "tor", count: 2 },
      { kind: "power", count: 4 },
      { kind: "compute", count: 10 },
      { kind: "switch", count: 9 },
      { kind: "compute", count: 8 },
      { kind: "power", count: 4 },
    ]);
  });

  it("puts the switch trays between the two compute blocks", () => {
    const kinds = NVL72_GEOMETRY.slots.map((slot) => slot.kind);
    const firstSwitch = kinds.indexOf("switch");

    expect(kinds.slice(0, firstSwitch).filter((k) => k === "compute")).toHaveLength(10);
    expect(kinds.slice(firstSwitch).filter((k) => k === "compute")).toHaveLength(8);
  });

  it("keeps the published rack proportions", () => {
    const [width, height, depth] = NVL72_GEOMETRY.rackSize;
    // 600 mm wide, 2294 mm tall, 1068 mm deep.
    expect(height / width).toBeCloseTo(2294 / 600, 2);
    expect(depth / width).toBeCloseTo(1068 / 600, 2);
    expect(NVL72_GEOMETRY.rackUnits * NVL72_GEOMETRY.unitHeight).toBeLessThan(height);
  });

  it("keeps every slot inside the rack between plinth and top cap", () => {
    const halfTray = NVL72_GEOMETRY.traySize[1] / 2;
    const bottom = NVL72_GEOMETRY.floorY + NVL72_GEOMETRY.plinthHeight;
    const top = NVL72_GEOMETRY.floorY + NVL72_GEOMETRY.rackSize[1] - NVL72_GEOMETRY.topCapHeight;

    for (const slot of NVL72_GEOMETRY.slots) {
      expect(slot.y - halfTray).toBeGreaterThanOrEqual(bottom);
      expect(slot.y + halfTray).toBeLessThanOrEqual(top);
    }
  });
});

describe("NVL72 tray internals", () => {
  it("splits each compute tray into two boards of one Grace CPU and two GPUs", () => {
    const { superchips, cpusPerComputeTray, gpusPerComputeTray } = NVL72_GEOMETRY;

    expect(superchips).toHaveLength(cpusPerComputeTray);
    for (const board of superchips) {
      expect(board.gpus).toHaveLength(gpusPerComputeTray / cpusPerComputeTray);
    }
    expect(superchips.flatMap((board) => board.gpus)).toHaveLength(gpusPerComputeTray);
  });

  it("places each Grace CPU forward of its two GPUs", () => {
    // Lenovo's labeled compute tray top view: front to rear the board runs
    // CPU then GPUs, with the GPUs rearmost behind the NVLink connectors.
    for (const board of NVL72_GEOMETRY.superchips) {
      for (const [, gpuZ] of board.gpus) {
        expect(board.cpu[1]).toBeGreaterThan(gpuZ);
      }
    }
  });

  it("puts the fan wall in front of the boards", () => {
    const forwardMost = Math.max(...NVL72_GEOMETRY.superchips.map((b) => b.cpu[1]));
    expect(NVL72_GEOMETRY.fanWallZ).toBeGreaterThan(forwardMost);
  });

  it("seats the NVSwitch chips at the rear of a switch tray", () => {
    expect(NVL72_GEOMETRY.switchChips).toHaveLength(NVL72_GEOMETRY.switchChipsPerTray);
    for (const [, z] of NVL72_GEOMETRY.switchChips) {
      expect(z).toBeLessThan(0);
    }
  });

  it("keeps every chip inside the tray footprint", () => {
    const [trayWidth, , trayDepth] = NVL72_GEOMETRY.traySize;
    const [chipWidth, , chipDepth] = NVL72_GEOMETRY.chipSize;
    const backZ = NVL72_GEOMETRY.trayFrontZ - trayDepth;
    const chips = [
      ...NVL72_GEOMETRY.superchips.flatMap((board) => [board.cpu, ...board.gpus]),
      ...NVL72_GEOMETRY.switchChips,
    ];

    for (const [x, z] of chips) {
      expect(Math.abs(x) + chipWidth / 2).toBeLessThanOrEqual(trayWidth / 2);
      expect(z + chipDepth / 2).toBeLessThan(NVL72_GEOMETRY.trayFrontZ);
      expect(z - chipDepth / 2).toBeGreaterThan(backZ);
    }
  });

  it("matches the front-face detail counted from the vendor rack photo", () => {
    expect(NVL72_GEOMETRY.computeBaysPerTray).toBe(8);
    expect(NVL72_GEOMETRY.switchPortCagesPerTray).toBe(5);
    expect(NVL72_GEOMETRY.psusPerShelf).toBe(6);
  });
});

describe("NVL72 rear structure", () => {
  it("runs four cable cartridges over the compute and switch trays only", () => {
    const { cartridges } = NVL72_GEOMETRY;
    const powerYs = slotsOfKind("power").map((slot) => slot.y);

    expect(cartridges.count).toBe(4);
    expect(cartridges.top).toBeGreaterThan(cartridges.bottom);
    expect(powerYs.every((y) => y > cartridges.top || y < cartridges.bottom)).toBe(true);
  });

  it("spans the cartridges across exactly 27 rack units", () => {
    const { cartridges, unitHeight } = NVL72_GEOMETRY;
    expect((cartridges.top - cartridges.bottom) / unitHeight).toBeCloseTo(27, 5);
  });

  it("pairs a return manifold on the left with a supply manifold on the right", () => {
    const [left, right] = NVL72_GEOMETRY.manifolds;
    expect(left.role).toBe("return");
    expect(right.role).toBe("supply");
    expect(left.x).toBeLessThan(0);
    expect(right.x).toBeGreaterThan(0);
  });

  it("keeps the rear structures behind the trays and inside the rack", () => {
    const { cartridges, busbar, manifolds, traySize, trayFrontZ, rackSize } = NVL72_GEOMETRY;
    const trayBackZ = trayFrontZ - traySize[2];
    const rackBackZ = -rackSize[2] / 2;

    for (const z of [cartridges.z, busbar.z, manifolds[0].z]) {
      expect(z).toBeLessThan(trayBackZ);
      expect(z).toBeGreaterThan(rackBackZ);
    }
    expect(busbar.z).toBeLessThan(cartridges.z);
  });
});
