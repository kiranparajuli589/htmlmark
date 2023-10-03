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
	 * @param {Function|null} codeHighlightFn - A function to highlight code blocks
	 *
	 * @returns {string} - The parsed HTML
	 */
	static h(lines, codeHighlightFn = null) {
		const lexer = new Lexer(lines)
		const parser = new Parser(lexer.run(), null, codeHighlightFn)
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

	/**
	 * For demo preview
	 *
	 * @param {String} str - The string to parse
	 * @param {Function|null} codeHighlightFn - A function to highlight code blocks
	 *
	 * @returns {{ elapsedTime: number, html: string, lex: Object}}
	 */
	static hP(str, codeHighlightFn = null) {
		const lines = str.split("\n")
		const start = Date.now()
		const lexer = new Lexer(lines)
		const lex = lexer.run()
		const parser = new Parser(lex, null, codeHighlightFn)
		const html = parser.run()
		const end = Date.now()
		return {
			elapsedTime: end - start,
			html,
			lex
		}
	}
}
