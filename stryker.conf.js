module.exports = function (config) {
  config.set({
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
    maxConcurrentTestRunners: 6,
    mochaOptions: {
      spec: ['test/**/*.js'],
      ui: 'bdd'
    },
    thresholds: {
      high: 95,
      low: 90,
      break: 90
    },
    dashboard: {
      project: 'github.com/nicojs/angular-cli-with-alternative-filesystem',
      baseUrl: 'https://dashboard.stryker-mutator.io/api/reports',
      version: 'master',
      fullReport: true
    }
  });
};
