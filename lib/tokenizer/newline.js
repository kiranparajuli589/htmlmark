import { TOKENS } from "../util/tokens.js"


export class Newline {
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
		return `<br>
`
	}
}
