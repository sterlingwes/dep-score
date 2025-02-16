import { getAbbreviatedPackument, getPackument } from "query-registry";
import type { Metadata, ScoreOptions } from "./types";
import { readPackageManifest } from "./utils";
import { asNumbers, parseSemver } from "./semver";
import { calculateScore, semverScoreDiff } from "./score";

const defaultOptions: ScoreOptions = {
  includeAge: false,
  includeDevDependencies: false,
};

const getDependencies = ({ includeDevDependencies } = defaultOptions) => {
  const packageJson = readPackageManifest();
  const { dependencies, devDependencies } = packageJson;
  const depKeys = Object.keys({
    ...dependencies,
    ...(includeDevDependencies ? devDependencies : {}),
  });
  return new Set(depKeys);
};

const millisecondsPerDay = 1000 * 60 * 60 * 24;

const fetchPackageDetails = async (
  moduleName: string,
  currentVersion: string,
  options?: ScoreOptions
) => {
  if (options?.includeAge) {
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
  options?: ScoreOptions
): Promise<Metadata> => {
  const manifest = readPackageManifest(moduleName);
  const { latestVersion, age } = await fetchPackageDetails(
    moduleName,
    manifest.version,
    options
  );
  const latestSemver = parseSemver(latestVersion);
  const currentSemver = parseSemver(manifest.version);
  const score = semverScoreDiff(currentSemver, latestSemver);
  return {
    versions: {
      current: asNumbers(currentSemver),
      latest: asNumbers(latestSemver),
      score,
    },
    age,
  };
};

export const getPackages = async (options?: ScoreOptions) => {
  const moduleLookup = new Map<string, Metadata>();
  const dependencies = getDependencies(options);
  for (const dependency of dependencies) {
    const data = await getPackageData(dependency, options);
    moduleLookup.set(dependency, data);
  }

  return moduleLookup;
};
