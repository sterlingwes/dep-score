import { getPackages } from "./getters";
import type { ScoreOptions } from "./types";
import { sumScores } from "./utils";

export const getDepScore = async (options: ScoreOptions) => {
  const packageLookup = await getPackages(options);
  return {
    score: sumScores(packageLookup),
    modules: packageLookup,
  };
};
