import { describe, it, expect, mock } from "bun:test";
import { readFileSync, writeFileSync } from "./fs.mjs";
import { getPackages } from "./packages.mjs";

describe("cli", () => {
  const mockExternals = () => {
    mock.module("./fs", () => ({
      resolve: (...args: any[]) => ["/home/user", ...args].join("/"),
      readFileSync: mock((path) => {
        if (path.endsWith("config.json")) {
          return JSON.stringify({
            tagGroups: {
              core: ["react", "react-native"],
            },
            shiftLeft: ["react-native"],
          });
        }
        return JSON.stringify({});
      }),
      writeFileSync: mock(() => {}),
    }));

    mock.module("./packages", () => ({
      getPackages: mock(() => Promise.resolve(new Map())),
    }));
  };

  describe("options parsing", () => {
    it("should allow config file and cli args", async () => {
      mockExternals();

      process.argv = [
        "node",
        "cli.mjs",
        "--config",
        "config.json",
        "--dev",
        "--json",
        "output.json",
        "--path",
        "project",
        "--verbose",
      ];

      await import("./cli.mjs");

      expect(readFileSync).toHaveBeenCalledWith("/home/user/config.json");
      expect(writeFileSync).toHaveBeenCalledWith(
        "/home/user/output.json",
        expect.any(String)
      );
      expect(getPackages).toHaveBeenCalledWith({
        includeAge: false,
        includeDevDependencies: true,
        projectPath: "/home/user/project",
        tagGroups: {
          core: ["react", "react-native"],
        },
        shiftLeft: ["react-native"],
      });
    });
  });
});
