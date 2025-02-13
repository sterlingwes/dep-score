import fs from "node:fs";
import { getAbbreviatedPackument, getPackument } from "query-registry";
import type { Metadata, ScoreOptions, Semver, SemverWeights } from "./types";

const defaultWeights: SemverWeights = { major: 100, minor: 10, patch: 1 };

const defaultOptions: ScoreOptions = {
  includeAge: false,
  includeDevDependencies: false,
};

const getDependencies = ({ includeDevDependencies } = defaultOptions) => {
  const packageJson = fs.readFileSync("package.json").toString();
  const { dependencies, devDependencies } = JSON.parse(packageJson);
  return new Set(
    Object.keys({
      ...dependencies,
      ...(includeDevDependencies ? devDependencies : {}),
    })
  );
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
  currentVersion: string,
  { includeAge }: ScoreOptions
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

const getPackageData = async (
  moduleName: string,
  options: ScoreOptions
): Promise<Metadata> => {
  const packagePath = require.resolve(`${moduleName}/package.json`);
  const manifest = JSON.parse(fs.readFileSync(packagePath).toString()) ?? {};
  const { latestVersion, age } = await fetchPackageDetails(
    moduleName,
    manifest.version,
    options
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

export const getPackages = async (options: ScoreOptions) => {
  const moduleLookup = new Map<string, Metadata>();
  const dependencies = getDependencies();
  for (const dependency of dependencies) {
    const data = await getPackageData(dependency, options);
    moduleLookup.set(dependency, data);
  }

  return moduleLookup;
};
