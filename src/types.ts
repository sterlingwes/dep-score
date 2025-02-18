export type Metadata = {
  tags: string[];
  versions: {
    current: number[];
    latest: number[];
    score: number;
  };
  age: number | undefined;
};

export interface ScoreOptions {
  projectPath?: string;
  includeAge?: boolean;
  includeDevDependencies?: boolean;
  tagGroups?: Record<string, string[]>;
  shiftLeft?: string[];
}

export interface InternalScoreOptions extends ScoreOptions {
  invertedTagGroups?: Record<string, string[]>;
}

export type Lockfile = {
  [packageName: string]: {
    version: string;
  };
};
