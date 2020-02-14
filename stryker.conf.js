module.exports = function(config) {
  config.set({
    mutate: ['src/**/*.ts', '!src/**/*.d.ts'],
    testRunner: 'mocha',
    mutator: 'typescript',
    transpilers: ['typescript'],
    reporters: ['dashboard'],
    testFramework: 'mocha',
    coverageAnalysis: 'perTest',
    tsconfigFile: 'tsconfig.json',
    maxConcurrentTestRunners: 2,
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
      reportType: 'full'
    }
  });
};
