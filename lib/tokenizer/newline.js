export class Newline {
	/**
	 * @param {string} text
	 * @returns {boolean}
	 */
	static test(text) {
		if (typeof text !== "string") return false
		return ["", "\n"].includes(text.trim())
	}

	/**
	 * returns HTML for a newline
	 *
	 * @returns {string}
	 */
	static parse() {
		return `
<br>`
	}
}
