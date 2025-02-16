# dep-score

Calculate a score for dev and direct node/npm dependencies of a project using a CLI tool and a combination of the semver components of each dependency, weighted by a value, and the age of the dependency relative to a reference date (current or fixed).

Useful for teams to understand how old their dependencies are and the trend of pay-down of this form of technical debt over time.

Future cases could include security audit reports based on severity with a weighting applied to those.
