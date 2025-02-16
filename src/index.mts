import { getPackages } from "./packages.mjs";
import type { ScoreOptions } from "./types.js";
import { sumScores } from "./utils.mjs";

export const getDepScore = async (options?: ScoreOptions) => {
  const packageLookup = await getPackages(options);
  return {
    score: sumScores(packageLookup),
    modules: Object.fromEntries(packageLookup),
  };
};
