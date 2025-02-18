import { resolve } from "node:path";

import { getPackages } from "./packages.mjs";
import type { ScoreOptions } from "./types.js";
import { formatOutput } from "./utils.mjs";

const transformOptions = (options?: ScoreOptions) => {
  if (options?.projectPath) {
    return { ...options, projectPath: resolve(options.projectPath) };
  }

  return options;
};

export const getDepScore = async (options?: ScoreOptions) => {
  const packageLookup = await getPackages(transformOptions(options));
  return formatOutput(packageLookup);
};
