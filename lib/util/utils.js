/**
 * Utilities Store for the Parser
 */
export class Utils {
	/**
	 * Checks if the given text matches the given regex
	 *
	 * @param {string} text
	 * @param {RegExp} regex
	 *
	 * @returns {boolean}
	 */
	static testRegex(text, regex) {
		regex.lastIndex = 0
		return !!regex.test(text)
	}

	/**
	 * Returns the regex matches for the given text
	 *
	 * @param {string} text
	 * @param {RegExp} regex
	 * @returns {RegExpExecArray}
	 */
	static execRegex(text, regex) {
		regex.lastIndex = 0
		return regex.exec(text)
	}

	/**
	 * Returns the index of the nth occurrence of the given character in the given text
	 * If the nth occurrence is not found, -1 is returned
	 *
	 * @param {string} text - Text to search in
	 * @param {number} position - Position of the nth occurrence
	 * @param {string} delimiter - Character to search for
	 *
	 * @returns {number}
	 */
	static getNthIndex(text, position, delimiter = ">") {
		let count = 0
		for (let i = 0; i < text.length; i++) {
			if (text[i] === delimiter) {
				count++
				if (count === position) {
					return i
				}
			}
		}
		return -1
	}
}
