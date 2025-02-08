# dep-score

Calculate a score for dev and direct node/npm dependencies of a project using a CLI tool and a combination of the semver components of each dependency, weighted by a value, and the age of the dependency relative to a reference date (current or fixed).

Useful for teams to understand how old their dependencies are and the trend of pay-down of this form of technical debt over time.

Future cases could include security audit reports based on severity with a weighting applied to those.

To calculate the score we'll breakdown the semver into its constituent parts:

- patch - these are the lowest value (1), unless major is 0, then they're considered minor (2)
- minor - these are slightly higher value than patch, unless the major is 0 (2)
- major - the version bump that typically takes the most effort (4)

For example, a dependency at 1.0.1 with 2.2.1 available would be (2*4 + 2*2 + 1*1) - (1*4 + 0*2 + 1*1) or 8.

The age component is calculated separately to determine individual dependency ages, allowing for the calculation of maxes, minimums, and averages as desired.
