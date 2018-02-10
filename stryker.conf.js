module.exports = function (config) {
  config.set({
    files: [
      { pattern: 'testResources/**/*', included: false, transpiled: false, mutated: false }
    ],
    mutate: [
      "src/**/*.ts",
      "!src/**/*.d.ts"
    ],
    testRunner: "mocha",
    mutator: "typescript",
    transpilers: ["typescript"],
    reporter: ["html", "clear-text", "progress", "dashboard"],
    testFramework: "mocha",
    coverageAnalysis: "off",
    tsconfigFile: "tsconfig.json",
    maxConcurrentTestRunners: 6
  });
};
