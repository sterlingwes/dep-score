export const parseSemver = (version: string): string[] => {
  return (version.split("-").shift() ?? "")
    .split(".")
    .filter((part) => /^\d+$/.test(part));
};

export const asNumbers = (parts: string[]): number[] => {
  return parts.map(Number);
};
