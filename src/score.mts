const leftPad = (value: number, padding = 3) => {
  return value.toString().padStart(padding, "0");
};

export const calculateScore = (semver: string[], shiftLeft = false): number => {
  const parts = semver.slice();
  if (shiftLeft) {
    parts.shift();
    parts.push("0");
  }
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
  latest: string[],
  shiftLeft = false
): number => {
  const currentScore = calculateScore(current, shiftLeft);
  const latestScore = calculateScore(latest, shiftLeft);
  return latestScore - currentScore;
};
