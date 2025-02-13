import fs from "node:fs";
import type { Metadata, Semver, SemverWeights } from "./types";
import { defaultWeights } from "./constants";

export const sumScores = (moduleLookup: Map<string, Metadata>) => {
  let total = 0;
  for (const { versions } of moduleLookup.values()) {
    total += versions.score;
  }
  return total;
};

export const readPackageManifest = (moduleName?: string) => {
  const packagePath = require.resolve(
    moduleName ? `${moduleName}/package.json` : "package.json"
  );
  const manifest = JSON.parse(fs.readFileSync(packagePath).toString()) ?? {};
  return manifest;
};

export const calculateScore = (
  semver: Semver,
  weightOverrides: Partial<SemverWeights> = defaultWeights
): number => {
  const [major, minor, patch] = semver;
  const weights = { ...defaultWeights, ...weightOverrides };

  if (!major) {
    return minor * weights.major + patch * weights.minor;
  }

  return major * weights.major + minor * weights.minor + patch * weights.patch;
};
