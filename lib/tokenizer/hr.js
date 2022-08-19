import { REGEX } from "../regex/index.js"

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
		REGEX.HR_LINE.lastIndex = 0
		return REGEX.HR_LINE.test(text)
	}

	/**
	 * returns HTML for horizontal line
	 *
	 * @returns {string}
	 */
	static parse() {
		return `
<hr>`
	}
}
