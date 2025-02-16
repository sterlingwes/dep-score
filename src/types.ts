export type Metadata = {
  versions: {
    current: number[];
    latest: number[];
    score: number;
  };
  age: number | undefined;
};

export type ScoreOptions = {
  includeAge?: boolean;
  includeDevDependencies?: boolean;
};
