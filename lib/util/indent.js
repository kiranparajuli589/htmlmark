/**
 * checks if number is in the given range
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
Number.prototype.inRange = function (a, b) {
	return this >= a && this <= b
}


/**
 * Markdown Indentation
 */
class Indent {
	indentSize
	tabSize

	constructor(indentSize, tabSize) {
		this.indentSize = indentSize
		this.tabSize = tabSize
	}

	/**
	 * returns the indentation count of the given text
	 *
	 * @param {string} text
	 *
	 * @returns {number}
	 */
	raw(text) {
		if (["", "\n", undefined].includes(text)) return 0
		let count = 0
		let index = 0
		while (text[index] === " " || text[index] === "\t") {
			count += (text[index] === " ") ? 1 : this.tabSize
			index++
		}
		return count
	}

	/**
	 * calculates the indentation of the given value
	 *
	 * @param {string} text
	 *
	 * @returns {number}
	 */
	calc(text) {
		const rawIndent = this.raw(text)
		return Math.floor(rawIndent / this.indentSize) * this.indentSize
	}

	/**
	 * returns the calculated indentation of the given text
	 *
	 * @param {string} text
	 *
	 * @returns {number}
	 */
	get(text) {
		return this.calc(text)
	}
}

export default Indent
