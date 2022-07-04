// eslint-disable-next-line
const rootDir = __dirname

module.exports = {
  testMatch: ["**/tests/**/*.spec.{js,ts}"],
  collectCoverage: true,
  coverageProvider: "v8",
  coverageReporters: ["lcov", "html", "text"],
  collectCoverageFrom: [
    "<rootDir>/lib/**/*.js",
  ],
  coverageDirectory: "<rootDir>/outputs/coverage",
}
