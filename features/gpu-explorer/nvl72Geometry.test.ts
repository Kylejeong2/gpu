import { describe, expect, it } from "vitest";
import { NVL72_GEOMETRY, countTrays } from "./nvl72Geometry";

describe("NVL72 rack geometry", () => {
  it("holds 18 compute trays and 9 NVLink switch trays", () => {
    expect(countTrays("compute")).toBe(18);
    expect(countTrays("switch")).toBe(9);
  });

  it("adds up to 72 GPUs and 36 Grace CPUs", () => {
    expect(countTrays("compute") * NVL72_GEOMETRY.gpusPerComputeTray).toBe(72);
    expect(countTrays("compute") * NVL72_GEOMETRY.cpusPerComputeTray).toBe(36);
  });

  it("places the switch trays in the middle of the compute trays", () => {
    const kinds = NVL72_GEOMETRY.traySlots.map((slot) => slot.kind);
    const firstSwitch = kinds.indexOf("switch");
    const lastSwitch = kinds.lastIndexOf("switch");

    expect(kinds.slice(firstSwitch, lastSwitch + 1).every((kind) => kind === "switch")).toBe(true);
    expect(kinds.slice(0, firstSwitch)).toContain("compute");
    expect(kinds.slice(lastSwitch + 1)).toContain("compute");
  });

  it("keeps every tray between the rack base and the top plate", () => {
    const halfTray = NVL72_GEOMETRY.traySize[1] / 2;
    const rackTop = NVL72_GEOMETRY.floorY + NVL72_GEOMETRY.rackSize[1];

    for (const slot of NVL72_GEOMETRY.traySlots) {
      expect(slot.y - halfTray).toBeGreaterThan(NVL72_GEOMETRY.floorY + NVL72_GEOMETRY.baseHeight);
      expect(slot.y + halfTray).toBeLessThan(rackTop - NVL72_GEOMETRY.baseHeight);
    }
  });

  it("splits each compute tray into two superchip modules of one Grace CPU and two GPUs", () => {
    const { superchips, cpusPerComputeTray, gpusPerComputeTray } = NVL72_GEOMETRY;

    expect(superchips).toHaveLength(cpusPerComputeTray);
    for (const superchip of superchips) {
      expect(superchip.gpus).toHaveLength(gpusPerComputeTray / cpusPerComputeTray);
    }
    expect(superchips.flatMap((superchip) => superchip.gpus)).toHaveLength(gpusPerComputeTray);
  });

  it("carries one NVSwitch chip position per switch chip in a switch tray", () => {
    expect(NVL72_GEOMETRY.switchChips).toHaveLength(NVL72_GEOMETRY.switchChipsPerTray);
  });

  it("keeps every chip inside the tray footprint", () => {
    const [trayWidth, , trayDepth] = NVL72_GEOMETRY.traySize;
    const [chipWidth, , chipDepth] = NVL72_GEOMETRY.chipSize;
    const backZ = NVL72_GEOMETRY.trayFrontZ - trayDepth;
    const chips = [
      ...NVL72_GEOMETRY.superchips.flatMap((superchip) => [superchip.cpu, ...superchip.gpus]),
      ...NVL72_GEOMETRY.switchChips,
    ];

    for (const [x, z] of chips) {
      expect(Math.abs(x) + chipWidth / 2).toBeLessThanOrEqual(trayWidth / 2);
      expect(z + chipDepth / 2).toBeLessThan(NVL72_GEOMETRY.trayFrontZ);
      expect(z - chipDepth / 2).toBeGreaterThan(backZ);
    }
  });

  it("runs the NVLink spine over the compute and switch trays only", () => {
    const powerYs = NVL72_GEOMETRY.traySlots.filter((slot) => slot.kind === "power").map((slot) => slot.y);
    const { top, bottom } = NVL72_GEOMETRY.spine;

    expect(top).toBeGreaterThan(bottom);
    expect(powerYs.every((y) => y > top || y < bottom)).toBe(true);
  });
});
