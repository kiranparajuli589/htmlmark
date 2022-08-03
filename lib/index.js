import { Lexer } from "./lexer/index.js"
import { Parser } from "./parser/index.js"
import { File } from "./util/file.js"


export default {
	Lexer,
	Parser,
	/**
   * a wrapper for the lexer and parser
   * @param {string} filePath file path
   * @returns a html string
   */
	h: (filePath) => {
		const fileContent = File.read(filePath)
		const lineArray = fileContent.split("\n")
		const start = Date.now()
		const lexer = new Lexer(lineArray)
		const parser = new Parser(lexer.run())
		const html = parser.run()
		const end = Date.now()
		console.info(`\x1b[35mParsing time: ${end - start}ms\x1b[0m`)
		return html
	}
}
