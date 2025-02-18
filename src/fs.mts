import * as NodePath from "node:path";
import * as NodeFS from "node:fs";

export const resolve = (...args: Parameters<typeof NodePath.resolve>) =>
  NodePath.resolve(...args);

export const readFileSync = (...args: Parameters<typeof NodeFS.readFileSync>) =>
  NodeFS.readFileSync(...args).toString();

export const writeFileSync = (
  ...args: Parameters<typeof NodeFS.writeFileSync>
) => NodeFS.writeFileSync(...args);
