import { Lexer } from "../lib/lexer"
import { Parser } from "../lib/parser"


export class MDP {
	indent
	codeHighlightFn
	constructor(config = {}) {
		this.indent = config.indent || 4
		this.codeHighlightFn = config.codeHighlightFn || null
	}

	t(lines) {
		const lexer = new Lexer(lines)
		return lexer.run()
	}

	h(lines) {
		const lexer = new Lexer(lines)
		const parser = new Parser(lexer.run(), null, this.codeHighlightFn)
		return parser.run()
	}
}
