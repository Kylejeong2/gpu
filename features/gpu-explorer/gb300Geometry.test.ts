import { describe, expect, it } from "vitest";
import { B200_SXM6_GEOMETRY } from "./b200Geometry";
import { GB300_GEOMETRY } from "./gb300Geometry";

describe("GB300 superchip visible geometry", () => {
  it("pairs one Grace CPU with two Blackwell Ultra GPUs", () => {
    expect(GB300_GEOMETRY.gpuCenters).toHaveLength(2);
    expect(GB300_GEOMETRY.graceCenter[0]).toBeLessThan(0);
    expect(GB300_GEOMETRY.gpuCenters.every(([x]) => x > 0)).toBe(true);
  });

  it("exposes 72 Grace cores in the architecture overlay", () => {
    expect(GB300_GEOMETRY.graceCoreColumns * GB300_GEOMETRY.graceCoreRows).toBe(72);
  });

  it("surrounds Grace with eight LPDDR5X modules", () => {
    expect(GB300_GEOMETRY.lpddrModules).toHaveLength(8);
  });

  it("keeps both scaled GPU packages inside the board without overlapping each other", () => {
    const [, , boardDepth] = GB300_GEOMETRY.boardSize;
    const [, , packageDepth] = B200_SXM6_GEOMETRY.packageSize;
    const scaledDepth = packageDepth * GB300_GEOMETRY.gpuScale;
    const [[, frontZ], [, backZ]] = GB300_GEOMETRY.gpuCenters;

    expect(backZ - frontZ).toBeGreaterThan(scaledDepth);
    expect(Math.abs(backZ) + scaledDepth / 2).toBeLessThan(boardDepth / 2);
  });

  it("gives every GPU an NVLink connector at the board edge", () => {
    expect(GB300_GEOMETRY.nvlinkConnectors).toHaveLength(GB300_GEOMETRY.gpuCenters.length);
  });
});
