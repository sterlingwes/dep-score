export type Metadata = {
  versions: {
    current: number[];
    latest: number[];
    score: number;
  };
  age: number | undefined;
};

export type ScoreOptions = {
  projectPath?: string;
  includeAge?: boolean;
  includeDevDependencies?: boolean;
};
