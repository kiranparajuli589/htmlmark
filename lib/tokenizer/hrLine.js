import { REGEX } from "../regex/index.js"
import { Utils, TOKENS } from "../util/index.js"

/**
 * Horizontal Line
 */
export class HrLine {
	static tokenName = TOKENS.HR_LINE

	/**
	 * @returns {boolean}
	 */
	static test({ line }) {
		return Utils.testRegex(line, REGEX.HR_LINE)
	}

	/**
	 * returns HTML for horizontal line
	 *
	 * @returns {string}
	 */
	static parse() {
		return "<hr>"
	}
}
