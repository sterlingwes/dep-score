const leftPad = (value: string, padding: number) => {
  return value.padStart(padding, "0");
};

export const defaultScoreOptions = {
  shiftLeft: false,
  allowOverflow: false,
  padding: 3,
};

export const calculateScore = (
  semver: string[],
  options = defaultScoreOptions
): number => {
  const { allowOverflow, shiftLeft, padding } = options;

  const parts = semver.slice();
  if (shiftLeft) {
    parts.shift();
    parts.push("0");
  }
  let score = "";
  let segments = 0;
  while (parts.length) {
    segments++;
    let value = parts.pop() ?? "0";
    if (!allowOverflow && value.length > padding && value[0] !== "0") {
      value = "9".repeat(padding);
    }
    score = `${leftPad(value, padding)}${score}`;
  }

  return +score;
};

export const semverScoreDiff = (
  current: string[],
  latest: string[],
  options = defaultScoreOptions
): number => {
  const currentScore = calculateScore(current, options);
  const latestScore = calculateScore(latest, options);
  return latestScore - currentScore;
};
