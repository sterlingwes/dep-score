import fs from "node:fs";
import { createRequire } from "node:module";
import type { Metadata } from "./types.js";

const requirePath = import.meta.dirname;
if (!requirePath) {
  throw new Error("dep-score requires node >=20");
}

const require = createRequire(requirePath);

export const sumScores = (moduleLookup: Map<string, Metadata>) => {
  let total = 0;
  for (const { versions } of moduleLookup.values()) {
    total += versions.score;
  }
  return total;
};

export const readPackageManifest = (moduleName?: string) => {
  const packagePath = require.resolve(
    moduleName ? `${moduleName}/package.json` : "./package.json"
  );
  const manifest = JSON.parse(fs.readFileSync(packagePath).toString()) ?? {};
  return manifest;
};
