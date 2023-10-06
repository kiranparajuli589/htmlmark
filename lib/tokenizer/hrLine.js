import { REGEX } from "../regex/index.js"
import { Utils } from "../util/utils.js"
import { TOKENS } from "../util/tokens.js"

/**
 * Horizontal Line
 */
export class HrLine {
	static tokenName = TOKENS.HR_LINE
	/**
	 * @param {string} text
	 *
	 * @returns {boolean}
	 */
	static test(text) {
		return Utils.testRegex(text, REGEX.HR_LINE)
	}

	/**
	 * returns HTML for horizontal line
	 *
	 * @returns {string}
	 */
	static parse() {
		return `<hr>
`
	}
}
