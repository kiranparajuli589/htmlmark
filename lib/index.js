import { Lexer } from "./lexer/index.js"
import { Parser } from "./parser/index.js"


export class HtmlMark {
	config = {}

	constructor(config = {}) {
		this.config.indent = config.indent || 4
		this.config.highlightFn = config.highlightFn || null
		this.config.useLinkRefs = config.useLinkRefs || false
	}

	tokenize(str) {
		if (typeof str !== "string") throw new Error("Input must be a string")
		const lexer = new Lexer(str.split("\n"), { config: this.config })
		return lexer.run()
	}

	parse(str) {
		if (typeof str !== "string") throw new Error("Input must be a string")
		const lex = this.tokenize(str)
		const parser = new Parser(lex, { config: this.config })
		return parser.run()
	}

	getFrontMatter(str) {
		if (typeof str !== "string") throw new Error("Input must be a string")
		const lexer = new Lexer(str.split("\n"))
		return lexer.getFrontMatter()
	}
}
