// major, minor, patch
export type Semver = [number, number, number];

export type Metadata = {
  versions: {
    current: Semver;
    latest: Semver;
    score: number;
  };
  age: number | undefined;
};

export type SemverWeights = {
  major: number;
  minor: number;
  patch: number;
};

export type ScoreOptions = {
  includeAge?: boolean;
  includeDevDependencies?: boolean;
  weights?: Partial<SemverWeights>;
};
