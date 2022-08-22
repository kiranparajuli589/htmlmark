import { Lexer } from "./lexer/index.js"
import { Parser } from "./parser/index.js"
import { File } from "./util/file.js"

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
	/**
	 * Runs HTML parsing for a file
   * a wrapper for the lexer and parser
	 *
   * @param {string} filePath - Path to a markdown file
   * @returns {string} - A HTML string
   */
	static hF(filePath) {
		const fileContent = File.read(filePath)
		const lineArray = fileContent.split("\n")
		return MDP.hT(lineArray)
	}
}
