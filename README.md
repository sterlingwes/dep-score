# dep-score

Calculate a numerical score based on the semantic versions of your project's dependencies. This score allows for monitoring how well you're keeping up with updates over time. It represents the "size of the difference" between the current versions of your installed dependencies, and the latest versions available.

There's a programmatic API and command line tool available.

`yarn add dep-score` | `npm install dep-score` | `bun install dep-score`

## Programmatic API

```ts
import { getDepScore } from "dep-score";

const score = getDepScore();
```

`getDepScore` can take an options object with any of the following values:

- `includeDevDependencies` (boolean) - include dev dependencies in your total score; defaults to false
- `includeAge` (boolean) - includes a value representing the number of days between the date of your current version and the latest release, for a specific dependency (this increases runtime as we need to fetch a larger resource from the registry)

The method returns a promise which resolves to an object with the following shape:

- `score` (integer) - sum of all dependency score diffs between the value for the latest semver and the current
- `modules` object lookup of dependencies keyed by module name, with `Metadata` object values ([see types](src/types.ts))

## CLI

The command line interface should be used by installing dep-score in your repository. Run it using your package manager:

`yarn dep-score` | `npm run dep-score` | `bun run dep-score`

Supports the following options:

- `--dev`, see `includeDevDependencies` above
- `--age`, see `includeAge` above
- `--verbose`

## Score Calculation

Any given semantic version is split into its consitutent parts and "padded" in order to allow for stable sort & subtraction. Here's some examples:

| semver |      score |
| :----: | ---------: |
| 0.73.6 |     73,006 |
| 1.0.0  |  1,000,000 |
| 2.10.3 |  2,010,003 |
| 19.1.2 | 19,001,002 |

The value included in the overall score accounts for the difference between two semvers for the same package.

For example:

0.73.6 as the latest version of a package, and 0.71.7 as the current version would lead to a score of 1,999. Once upgraded to 0.72.0, the score would then be 1,006.
