import { describe, it, expect } from "bun:test";

import { calculateScore } from "./utils";

describe("calculateScore", () => {
  it("should use default weights", () => {
    expect(calculateScore([1, 0, 0])).toBe(100);
    expect(calculateScore([1, 1, 0])).toBe(110);
    expect(calculateScore([1, 1, 1])).toBe(111);
  });

  describe("when major version is 0", () => {
    it("should shift weights for minor and patch to major and minor", () => {
      expect(calculateScore([0, 1, 0])).toBe(100);
      expect(calculateScore([0, 0, 1])).toBe(10);
    });
  });
});
