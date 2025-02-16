const leftPad = (value: number, padding = 3) => {
  return value.toString().padStart(padding, "0");
};

export const calculateScore = (semver: string[]): number => {
  const parts = semver.slice();
  let score = "";
  let segments = 0;
  while (parts.length) {
    segments++;
    const value = parts.pop() ?? "0";
    score = `${leftPad(+value)}${score}`;
  }

  return +score;
};

export const semverScoreDiff = (
  current: string[],
  latest: string[]
): number => {
  const currentScore = calculateScore(current);
  const latestScore = calculateScore(latest);
  return latestScore - currentScore;
};
