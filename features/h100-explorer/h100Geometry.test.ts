import { describe, expect, it } from "vitest";
import { H100_SXM5_GEOMETRY } from "./h100Geometry";

describe("H100 SXM5 visible geometry", () => {
  it("uses the wide SXM5 board silhouette from the public reference", () => {
    const [width, , depth] = H100_SXM5_GEOMETRY.boardSize;
    expect(width / depth).toBeCloseTo(2.15, 2);
  });

  it("distinguishes five active HBM3 stacks from the sixth physical package site", () => {
    expect(H100_SXM5_GEOMETRY.packageSites).toHaveLength(6);
    expect(H100_SXM5_GEOMETRY.packageSites.filter((site) => site.kind === "memory")).toHaveLength(5);
  });

  it("keeps the eight visible copper mounting holes", () => {
    expect(H100_SXM5_GEOMETRY.mountingHoles).toHaveLength(8);
  });
});
