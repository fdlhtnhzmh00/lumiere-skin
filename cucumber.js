const config = {
  default: {
    require: ["tests/bdd/step-definitions/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: [
      "@cucumber/pretty-formatter",
      "html:tests/bdd/reports/cucumber-report.html",
      "json:tests/bdd/reports/cucumber-report.json",
    ],
    paths: ["tests/bdd/features/**/*.feature"],
    publishQuiet: true,
  },
};

module.exports = config;
