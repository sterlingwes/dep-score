import { describe, it, expect } from "bun:test";
import { withOptions } from "./utils.mjs";

describe("utils", () => {
  describe("withOptions", () => {
    it("should return defaults with defined options overridden", () => {
      const newOptions = withOptions(
        { shiftLeft: false, allowOverflow: false, padding: 3 },
        { allowOverflow: true, padding: 2 }
      );
      expect(newOptions).toEqual({
        shiftLeft: false,
        allowOverflow: true,
        padding: 2,
      });
    });
  });
});
