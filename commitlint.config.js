/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 72],
    "scope-enum": [
      2,
      "always",
      [
        "domain",
        "features",
        "components",
        "lib",
        "app",
        "config",
        "openapi",
        "deps",
        "ci",
        "test",
        "biome",
        "claude",
      ],
    ],
  },
};
