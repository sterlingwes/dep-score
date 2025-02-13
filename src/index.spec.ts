import { describe, it, expect, mock } from "bun:test";

import { getDepScore } from "./index";
import { calculateScore } from "./utils";
import { Semver } from "./types";

describe("programmatic api", () => {
  const latestVersions = {
    lodash: "4.17.21",
    react: "19.0.0",
    jest: "29.1.0",
  };

  const currentVersions = {
    lodash: "4.17.21",
    react: "17.0.5",
    jest: "27.0.6",
  };

  const mockExternals = () => {
    mock.module("./utils", () => ({
      readPackageManifest: (moduleName?: string) => {
        if (!moduleName) {
          return {
            dependencies: {
              lodash: "^4.17.21",
              react: "^17.0.2",
            },
            devDependencies: {
              jest: "^27.0.6",
            },
          };
        }

        if (currentVersions[moduleName]) {
          return {
            name: moduleName,
            version: currentVersions[moduleName],
          };
        }

        throw new Error(
          `Cannot read manifest for module '${moduleName ?? "current"}'`
        );
      },
    }));

    mock.module("query-registry", () => ({
      getAbbreviatedPackument: (name: string) => {
        if (!latestVersions[name]) throw new Error(`Unknown package: ${name}`);
        return Promise.resolve({
          "dist-tags": {
            latest: latestVersions[name],
          },
        });
      },
      getPackument: (name: string) => {
        if (!latestVersions[name]) throw new Error(`Unknown package: ${name}`);
        return Promise.resolve({
          "dist-tags": {
            latest: latestVersions[name],
          },
          time: {
            [latestVersions[name]]: Date.now(),
          },
        });
      },
    }));
  };

  describe("score calc", () => {
    it("should diff latest and current version", async () => {
      const latestScore = Object.entries(latestVersions).reduce(
        (score, [, version]) => {
          const versionParts = version.split(".").map(Number);
          return calculateScore(versionParts as Semver) + score;
        },
        0
      );

      const currentScore = Object.entries(currentVersions).reduce(
        (score, [, version]) => {
          const versionParts = version.split(".").map(Number);
          return calculateScore(versionParts as Semver) + score;
        },
        0
      );

      mockExternals();

      const result = await getDepScore({ includeDevDependencies: true });
      expect(result.score).toBe(latestScore - currentScore);
    });

    describe("overrides", () => {
      it("should allow overriding semver weights", async () => {
        mockExternals();

        const result = await getDepScore({
          weights: {
            major: 1000,
          },
        });
        expect(result.score).toBe(1995); // entirely the react score (no dev deps: jest)
      });
    });
  });

  describe("runtime only score (default)", () => {
    it("should return score and lookup", async () => {
      mockExternals();

      const result = await getDepScore();
      expect(result).toMatchInlineSnapshot(`
        {
          "modules": {
            "lodash": {
              "age": undefined,
              "versions": {
                "current": [
                  4,
                  17,
                  21,
                ],
                "latest": [
                  4,
                  17,
                  21,
                ],
                "score": 0,
              },
            },
            "react": {
              "age": undefined,
              "versions": {
                "current": [
                  17,
                  0,
                  5,
                ],
                "latest": [
                  19,
                  0,
                  0,
                ],
                "score": 195,
              },
            },
          },
          "score": 195,
        }
      `);
    });
  });
});
