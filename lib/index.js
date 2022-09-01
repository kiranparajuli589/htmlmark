import { Lexer } from "./lexer/index.js"
import { Parser } from "./parser/index.js"

/**
 * Markdown Parser
 */
export class MDP {
	/**
	 * Runs the HTML parsing for the given lines of text
	 *
	 * @param {Array} lines - An array of lines of text
	 *
	 * @returns {string} - The parsed HTML
	 */
	static h(lines) {
		const lexer = new Lexer(lines)
		const parser = new Parser(lexer.run())
		return parser.run()
	}

	/**
	 * Runs HTML parsing for the lines of text
	 *
	 * @param {Array} lines - An array of lines of text
	 *
	 * @returns {string} - The parsed HTML
	 */
	static hT(lines) {
		const start = Date.now()
		const html = MDP.h(lines)
		const end = Date.now()
		console.info(`\x1b[35mParsing time: ${end - start}ms\x1b[0m`)
		return html
	}
}
