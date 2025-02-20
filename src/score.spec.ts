import { describe, it, expect } from "bun:test";

import { calculateScore, semverScoreDiff } from "./score.mjs";

const shiftLeft = {
  shiftLeft: true,
  allowOverflow: false,
  padding: 3,
};

describe("calculateScore", () => {
  it("should use default weights", () => {
    expect(calculateScore(["1", "0", "0"])).toBe(1000000);
    expect(calculateScore(["1", "1", "0"])).toBe(1001000);
    expect(calculateScore(["1", "1", "1"])).toBe(1001001);
  });

  describe("when major version is 0", () => {
    it("should shift weights for minor and patch to major and minor", () => {
      expect(calculateScore(["0", "1", "0"])).toBe(1000);
      expect(calculateScore(["0", "0", "1"])).toBe(1);
    });

    describe("when asked to shift left", () => {
      it("should shift weights for minor and patch to major and minor", () => {
        expect(calculateScore(["0", "1", "0"], shiftLeft)).toBe(1000000);
        expect(calculateScore(["0", "0", "1"], shiftLeft)).toBe(1000);
      });
    });
  });

  describe("when minor or patch overflows default padding", () => {
    it("should cap the value", () => {
      expect(calculateScore(["1", "1000", "0"])).toBe(1999000);
      expect(calculateScore(["1", "0", "1000"])).toBe(1000999);
    });
  });
});

describe("semverScoreDiff", () => {
  describe("when only a patch difference", () => {
    it("should have a small diff score", () => {
      expect(semverScoreDiff(["19", "0", "0"], ["19", "0", "1"])).toBe(1);
    });
  });

  describe("when only a major difference", () => {
    it("should have a large diff score", () => {
      expect(semverScoreDiff(["19", "0", "0"], ["20", "0", "0"])).toBe(1000000);
    });
  });

  describe("when overlapping minor and patch differences", () => {
    it("should have a positive diff", () => {
      expect(semverScoreDiff(["2", "0", "20"], ["2", "1", "0"])).toBe(
        2001000 - 2000020
      );
    });
  });

  describe("shift left", () => {
    it("give the same diff to a comparable unshifted version", () => {
      expect(
        semverScoreDiff(["0", "19", "0"], ["0", "20", "0"], shiftLeft)
      ).toBe(1000000);
    });
  });
});
