import { REGEX } from "../regex/index.js"
import { Utils } from "../util/utils.js"

/**
 * Horizontal Line
 */
export class HR {
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
