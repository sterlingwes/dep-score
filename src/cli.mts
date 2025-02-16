import { performance } from "node:perf_hooks";

import manifest from "../package.json";
import { getPackages } from "./packages.mjs";
import { sumScores } from "./utils.mjs";
import type { Metadata } from "./types.js";

const includeAge = process.argv.includes("--age");
const includeDevDependencies = process.argv.includes("--dev");
const verbose = process.argv.includes("--verbose");

const logTable = (moduleLookup: Map<string, Metadata>) => {
  console.table(
    Array.from(moduleLookup.entries()).map(([name, { versions, age }]) => ({
      name,
      current: versions.current.join("."),
      latest: versions.latest.join("."),
      score: versions.score,
      days: age,
    })),
    ["name", "current", "latest", "score"].concat(includeAge ? ["days"] : [])
  );
};

const start = performance.now();
getPackages({ includeAge, includeDevDependencies }).then((moduleLookup) => {
  if (verbose) {
    logTable(moduleLookup);
  }

  console.log(`\ndep-score v${manifest.version}\n\n`);
  console.log("Your score: ", sumScores(moduleLookup));
  console.log("Modules: ", moduleLookup.size);
  console.log(`Time taken: ${performance.now() - start}ms`);
});
