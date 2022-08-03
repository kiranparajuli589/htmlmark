import { dirname } from "path"
import { fileURLToPath } from "url"


const __filename = fileURLToPath(import.meta.url)
// eslint-disable-next-line
const rootDir = dirname(__filename)

const config = {
	testMatch: ["**/tests/**/*.spec.{js,ts}"],
	collectCoverage: true,
	coverageProvider: "v8",
	coverageReporters: ["lcov", "html", "text"],
	collectCoverageFrom: [
		"<rootDir>/lib/**/*.js"
	],
	coverageDirectory: "<rootDir>/outputs/coverage"
}

export default config
