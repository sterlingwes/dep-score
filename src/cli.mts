import { performance } from "node:perf_hooks";

import manifest from "../package.json" with { type: "json" };
import { resolve, readFileSync, writeFileSync } from "./fs.mjs";
import { getPackages } from "./packages.mjs";
import { formatOutput, sumScores } from "./utils.mjs";
import type { Metadata, ScoreOptions } from "./types.js";

const hasConfig = process.argv.find((arg) => arg.startsWith("--config"));
const includeAge = process.argv.includes("--age");
const includeDevDependencies = process.argv.includes("--dev");
const writeJson = process.argv.find((arg) => arg.startsWith("--json"));
const useProjectPath = process.argv.find((arg) => arg.startsWith("--path"));
const verbose = process.argv.includes("--verbose");

let jsonPath = "";
if (writeJson) {
  const writePathValue = process.argv[process.argv.indexOf(writeJson) + 1];
  if (!writePathValue.startsWith("-")) {
    jsonPath = resolve(writePathValue);
  }
}

let projectPath = "";
if (useProjectPath) {
  const projectPathValue =
    process.argv[process.argv.indexOf(useProjectPath) + 1];
  if (!projectPathValue.startsWith("-")) {
    projectPath = resolve(projectPathValue);
  }
}

let configPath = "";
if (hasConfig) {
  const configPathValue = process.argv[process.argv.indexOf(hasConfig) + 1];
  if (!configPathValue.startsWith("-")) {
    configPath = resolve(configPathValue);
  }
}

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

const resolveOptions = () => {
  let configFile: Partial<ScoreOptions> = {};
  if (configPath) {
    configFile = JSON.parse(readFileSync(configPath)) ?? {};
  }

  return {
    ...configFile,
    includeAge,
    includeDevDependencies,
    projectPath,
  };
};

const resolvedOptions = resolveOptions();
getPackages(resolvedOptions).then((moduleLookup) => {
  if (verbose) {
    console.log("dep-score options:", {
      ...resolvedOptions,
      configPath,
      jsonPath,
    });

    logTable(moduleLookup);
  }

  console.log(`\ndep-score v${manifest.version}\n`);
  console.log("Your score:\t", sumScores(moduleLookup));
  console.log("Modules:\t", moduleLookup.size);

  if (jsonPath) {
    writeFileSync(
      jsonPath,
      JSON.stringify(formatOutput(moduleLookup), null, 2)
    );
  }

  console.log(`\nTime taken: ${performance.now() - start}ms`);
});
