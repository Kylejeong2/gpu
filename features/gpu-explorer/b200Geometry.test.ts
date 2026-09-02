import { describe, expect, it } from "vitest";
import { B200_SXM6_GEOMETRY } from "./b200Geometry";

describe("B200 SXM6 visible geometry", () => {
  it("keeps the SXM board silhouette shared with the H100 module", () => {
    const [width, , depth] = B200_SXM6_GEOMETRY.boardSize;
    expect(width / depth).toBeCloseTo(2.15, 2);
  });

  it("places two dies side by side inside the package", () => {
    const [left, right] = B200_SXM6_GEOMETRY.dieCenters;
    const [dieWidth] = B200_SXM6_GEOMETRY.dieSize;
    expect(B200_SXM6_GEOMETRY.dieCenters).toHaveLength(2);
    expect(left).toBeCloseTo(-right, 5);
    expect(right - left).toBeGreaterThan(dieWidth);
  });

  it("flanks the die pair with eight HBM3e stacks, four per side", () => {
    const stacks = B200_SXM6_GEOMETRY.hbmStacks;
    const [, dieRight] = B200_SXM6_GEOMETRY.dieCenters;
    const dieEdge = dieRight + B200_SXM6_GEOMETRY.dieSize[0] / 2;

    expect(stacks).toHaveLength(8);
    expect(stacks.filter(([x]) => x < -dieEdge)).toHaveLength(4);
    expect(stacks.filter(([x]) => x > dieEdge)).toHaveLength(4);
  });

  it("keeps every package site inside the package footprint", () => {
    const [packageWidth, , packageDepth] = B200_SXM6_GEOMETRY.packageSize;
    const [hbmWidth, , hbmDepth] = B200_SXM6_GEOMETRY.hbmSize;

    for (const [x, z] of B200_SXM6_GEOMETRY.hbmStacks) {
      expect(Math.abs(x) + hbmWidth / 2).toBeLessThan(packageWidth / 2);
      expect(Math.abs(z) + hbmDepth / 2).toBeLessThan(packageDepth / 2);
    }
  });

  it("keeps the eight visible copper mounting holes", () => {
    expect(B200_SXM6_GEOMETRY.mountingHoles).toHaveLength(8);
  });
});
