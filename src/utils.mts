import fs from "node:fs";
import { createRequire } from "node:module";
import type { Metadata } from "./types.js";

const cwd = process.cwd();
const require = createRequire(cwd);

export const sumScores = (moduleLookup: Map<string, Metadata>) => {
  let total = 0;
  for (const { versions } of moduleLookup.values()) {
    total += versions.score;
  }
  return total;
};

export const readPackageManifest = (moduleName?: string) => {
  const packagePath = require.resolve(
    moduleName
      ? `${cwd}/node_modules/${moduleName}/package.json`
      : `${cwd}/package.json`
  );
  const manifest = JSON.parse(fs.readFileSync(packagePath).toString()) ?? {};
  return manifest;
};
