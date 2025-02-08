import fs from "node:fs";
import { performance } from "node:perf_hooks";
import { getAbbreviatedPackument, getPackument } from "query-registry";

type SemverWeights = {
  major: number;
  minor: number;
  patch: number;
};

const defaultWeights: SemverWeights = { major: 100, minor: 10, patch: 1 };

const includeAge = process.argv.includes("--age");
const includeDevDependencies = process.argv.includes("--dev");
const verbose = process.argv.includes("--verbose");

const getDependencies = () => {
  const packageJson = fs.readFileSync("package.json").toString();
  const { dependencies, devDependencies } = JSON.parse(packageJson);
  return new Set(
    Object.keys({
      ...dependencies,
      ...(includeDevDependencies ? devDependencies : {}),
    })
  );
};

// major, minor, patch
type Semver = [number, number, number];

type Metadata = {
  versions: {
    current: Semver;
    latest: Semver;
    score: number;
  };
  age: number | undefined;
};

const parseSemver = (version: string): Semver => {
  const [major, minor, patch] = (version.split("-").shift() ?? "")
    .split(".")
    .map(Number);
  return [major, minor, patch];
};

const calculateScore = (semver: Semver): number => {
  const [major, minor, patch] = semver;
  if (!major) {
    return minor * defaultWeights.major + patch * defaultWeights.minor;
  }

  return (
    major * defaultWeights.major +
    minor * defaultWeights.minor +
    patch * defaultWeights.patch
  );
};

const millisecondsPerDay = 1000 * 60 * 60 * 24;

const fetchPackageDetails = async (
  moduleName: string,
  currentVersion: string
) => {
  if (includeAge) {
    const packument = await getPackument(moduleName);
    const latestVersion = packument["dist-tags"].latest;
    const currentTime = packument.time[currentVersion];
    const latestTime = packument.time[latestVersion];
    console.log(
      moduleName,
      currentVersion,
      currentTime,
      latestVersion,
      latestTime
    );
    return {
      latestVersion,
      age: Math.floor(
        (Date.parse(latestTime) - Date.parse(currentTime)) / millisecondsPerDay
      ),
    };
  }

  const packument = await getAbbreviatedPackument(moduleName);
  const latestVersion = packument["dist-tags"].latest;
  return { latestVersion };
};

const getPackageData = async (moduleName: string): Promise<Metadata> => {
  const packagePath = require.resolve(`${moduleName}/package.json`);
  const manifest = JSON.parse(fs.readFileSync(packagePath).toString()) ?? {};
  const { latestVersion, age } = await fetchPackageDetails(
    moduleName,
    manifest.version
  );
  const latestSemver = parseSemver(latestVersion);
  const currentSemver = parseSemver(manifest.version);
  const latestScore = calculateScore(latestSemver);
  const currentScore = calculateScore(currentSemver);
  const score = latestScore - currentScore;
  return {
    versions: { current: currentSemver, latest: latestSemver, score },
    age,
  };
};

const getPackages = async () => {
  const moduleLookup = new Map<string, Metadata>();
  const dependencies = getDependencies();
  for (const dependency of dependencies) {
    const data = await getPackageData(dependency);
    moduleLookup.set(dependency, data);
  }

  return moduleLookup;
};

const sumScores = (moduleLookup: Map<string, Metadata>) => {
  let total = 0;
  for (const { versions } of moduleLookup.values()) {
    total += versions.score;
  }
  return total;
};

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
getPackages().then((moduleLookup) => {
  if (verbose) {
    logTable(moduleLookup);
  }

  console.log("Your score: ", sumScores(moduleLookup));
  console.log("Modules: ", moduleLookup.size);
  console.log(`Time taken: ${performance.now() - start}ms`);
});
