import fs from "node:fs";
import { createRequire } from "node:module";
import yarnLock from "@yarnpkg/lockfile";

import type { Metadata } from "./types.js";

const require = createRequire(process.cwd());

export const sumScores = (moduleLookup: Map<string, Metadata>) => {
  let total = 0;
  for (const { versions } of moduleLookup.values()) {
    total += versions.score;
  }
  return total;
};

export const readPackageManifest = (
  moduleName?: string,
  cwd = process.cwd()
) => {
  const packagePath = require.resolve(
    moduleName
      ? `${cwd}/node_modules/${moduleName}/package.json`
      : `${cwd}/package.json`
  );
  const manifest = JSON.parse(fs.readFileSync(packagePath).toString()) ?? {};
  return manifest;
};

const getModuleName = (moduleNameWithVersionConstraint: string) => {
  if (moduleNameWithVersionConstraint.startsWith("@")) {
    return "@" + moduleNameWithVersionConstraint.slice(1).split("@").shift();
  }

  return (
    moduleNameWithVersionConstraint.split("@").shift() ??
    moduleNameWithVersionConstraint
  );
};

export const readYarnLockfile = (cwd = process.cwd()) => {
  try {
    const lockfile = fs.readFileSync(`${cwd}/yarn.lock`).toString();
    const parsed = yarnLock.parse(lockfile);
    if (parsed?.object) {
      return Object.keys(parsed.object).reduce(
        (acc, key) => ({
          ...acc,
          [getModuleName(key)]: { version: parsed.object[key].version },
        }),
        {}
      );
    }
  } catch (_) {
    return undefined;
  }
};

export const formatOutput = (packageLookup: Map<string, Metadata>) => {
  return {
    score: sumScores(packageLookup),
    modules: Object.fromEntries(packageLookup),
  };
};
