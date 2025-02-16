import { performance } from "node:perf_hooks";

import { getPackages } from "./packages";
import { sumScores } from "./utils";
import type { Metadata } from "./types";

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

  console.log("Your score: ", sumScores(moduleLookup));
  console.log("Modules: ", moduleLookup.size);
  console.log(`Time taken: ${performance.now() - start}ms`);
});
