export class Indent {
	/**
	 * returns the indentation count of the given text
	 *
	 * @param {string} text
	 *
	 * @returns {number}
	 */
	static get(text) {
		if (["", "\n", undefined].includes(text)) return 0
		let count = 0
		while (text[count] === " " || text[count] === "\t") {
			count++
		}
		return count
	}
}
