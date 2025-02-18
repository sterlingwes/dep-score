import { getAbbreviatedPackument, getPackument } from "query-registry";
import type {
  InternalScoreOptions,
  Lockfile,
  Metadata,
  ScoreOptions,
} from "./types.js";
import {
  invertTagGroups,
  readPackageManifest,
  readYarnLockfile,
  withUserTags,
} from "./utils.mjs";
import { asNumbers, parseSemver } from "./semver.mjs";
import { calculateScore, semverScoreDiff } from "./score.mjs";

const defaultOptions: ScoreOptions = {
  includeAge: false,
  includeDevDependencies: false,
};

const getDependencies = ({
  includeDevDependencies,
  projectPath,
} = defaultOptions) => {
  const packageJson = readPackageManifest(undefined, projectPath);
  const { dependencies, devDependencies } = packageJson;
  return {
    runtime: new Set(Object.keys(dependencies || {})),
    dev: includeDevDependencies
      ? new Set(Object.keys(devDependencies || {}))
      : new Set<string>(),
  };
};

const millisecondsPerDay = 1000 * 60 * 60 * 24;

let zodIssueLogged = false;

const logIfZodIssue = (e: any) => {
  if (e.issues?.length && !zodIssueLogged) {
    zodIssueLogged = true;
    console.warn(
      `Detected Zod registry response validation issue that may indicate a bad global install of dep-score. Some versions of Zod do not validate the registry response correctly. Zod is a dependency of query-registry, which is a dependency of dep-score. Consider re-installing dep-score globally after uninstalling some of these global packages. Alternatively, do not install dep-score globally and use it as a dev dependency in your repository.`
    );
  }
};

const fetchPackageDetails = async (
  moduleName: string,
  currentVersion: string,
  options?: ScoreOptions
) => {
  if (options?.includeAge) {
    try {
      const packument = await getPackument(moduleName);
      const latestVersion = packument["dist-tags"].latest;
      const currentTime = packument.time[currentVersion];
      const latestTime = packument.time[latestVersion];
      return {
        latestVersion,
        age: Math.floor(
          (Date.parse(latestTime) - Date.parse(currentTime)) /
            millisecondsPerDay
        ),
      };
    } catch (e: any) {
      logIfZodIssue(e);
      console.log(`Failed to fetch packument for ${moduleName}`);
    } finally {
      return { latestVersion: currentVersion, age: undefined };
    }
  }

  try {
    const packument = await getAbbreviatedPackument(moduleName);
    const latestVersion = packument["dist-tags"].latest;
    return { latestVersion };
  } catch (e: any) {
    logIfZodIssue(e);
    console.log(`Failed to fetch abbreviated packument for ${moduleName}`);
    return { latestVersion: currentVersion };
  }
};

const getPackageData = async ({
  moduleName,
  isDev,
  options,
  lockfile,
}: {
  moduleName: string;
  isDev: boolean;
  options?: InternalScoreOptions;
  lockfile?: Lockfile;
}): Promise<Metadata> => {
  let version = "";
  if (lockfile?.[moduleName]) {
    version = lockfile[moduleName].version;
  }

  if (!version) {
    const manifest = readPackageManifest(moduleName, options?.projectPath);
    version = manifest.version;
  }

  const { latestVersion, age } = await fetchPackageDetails(
    moduleName,
    version,
    options
  );
  const latestSemver = parseSemver(latestVersion);
  const currentSemver = parseSemver(version);
  const score = semverScoreDiff(currentSemver, latestSemver);
  return {
    tags: withUserTags(
      moduleName,
      isDev ? ["dev"] : ["runtime"],
      options?.invertedTagGroups
    ),
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
  const { runtime, dev } = getDependencies(options);
  const yarnLock = readYarnLockfile(options?.projectPath);
  const invertedTagGroups = options?.tagGroups
    ? invertTagGroups(options.tagGroups)
    : undefined;
  for (const dependency of [...runtime, ...dev]) {
    const data = await getPackageData({
      moduleName: dependency,
      isDev: dev.has(dependency),
      options: { ...options, invertedTagGroups },
      lockfile: yarnLock,
    });
    moduleLookup.set(dependency, data);
  }

  return moduleLookup;
};
