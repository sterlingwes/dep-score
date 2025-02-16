import fs from "node:fs";
import type { Metadata } from "./types";

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
