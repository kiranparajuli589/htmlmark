import Lexer from "../../lib/lexer"
import Parser from "../../lib/parser"

/**
 * Markdown Parser for Javascript Application
 */
export class MDP {
	config = {}
	constructor(config = {}) {
		this.config.indent = config.indent || 4
		this.config.highlightFn = config.highlightFn || null
	}
	/**
	 * Runs the HTML parsing for the given lines of text
	 *
	 * @param {Array} lines - An array of lines of text
	 *
	 * @returns {string} - The parsed HTML
	 */
	h(lines) {
		const lexer = new Lexer(lines, {config: this.config})
		const parser = new Parser(lexer.run(), {config: this.config})
		return parser.run()
	}

	/**
	 * Runs HTML parsing for the lines of text
	 *
	 * @param {Array} lines - An array of lines of text
	 *
	 * @returns {string} - The parsed HTML
	 */
	hT(lines) {
		const start = Date.now()
		const html = this.h(lines)
		const end = Date.now()
		console.info(`\x1b[35mParsing time: ${end - start}ms\x1b[0m`)
		return html
	}

	/**
	 * For demo preview
	 *
	 * @param {String} str - The string to parse
	 *
	 * @returns {{ elapsedTime: number, html: string, lex: Object}}
	 */
	hP(str) {
		const lines = str.split("\n")
		const start = Date.now()
		const lexer = new Lexer(lines, {config: this.config})
		const lex = lexer.run()
		const parser = new Parser(lex, {config: this.config})
		const html = parser.run()
		const end = Date.now()
		return {
			elapsedTime: end - start,
			html,
			lex
		}
	}
}
