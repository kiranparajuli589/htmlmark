import { Lexer } from "./lexer/index.js"
import { Parser } from "./parser/index.js"


export class MarkdownParser {
	indent
	codeHighlightFn
	frontMatter
	noLinkRefUsage
	constructor(config = {}) {
		this.indent = config.indent || 4
		this.codeHighlightFn = config.codeHighlightFn || null
		this.frontMatter = config.frontMatter || false
		this.noLinkRefUsage = config.noLinkRefUsage || false
	}
	tokenize(str) {
		if (typeof str !== "string") throw new Error("Input must be a string")
		const lexer = new Lexer(str.split("\n"), null, this.frontMatter)
		return lexer.run()
	}
	parse(str) {
		if (typeof str !== "string") throw new Error("Input must be a string")
		const lex = this.tokenize(str)
		const parser = new Parser(lex, null, this.codeHighlightFn)
		return parser.run()
	}
	getFrontMatter(str) {
		if (typeof str !== "string") throw new Error("Input must be a string")
		const lexer = new Lexer(str.split("\n"), null, true)
		return lexer.getFrontMatter()
	}
}
