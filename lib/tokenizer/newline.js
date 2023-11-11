import { TOKENS } from "../util/index.js"


class Newline {
	static tokenName = TOKENS.NEW_LINE

	static test({ line }) {
		if (typeof line !== "string") return false
		return ["", "\n"].includes(line.trim())
	}

	/**
	 * returns HTML for a newline
	 *
	 * @returns {string}
	 */
	static parse() {
		return "<br>"
	}
}

export default Newline
