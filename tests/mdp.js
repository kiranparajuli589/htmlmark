import Lexer from "../lib/lexer"
import Parser from "../lib/parser"


export class MDP {
	config = {}
	constructor(config = {}) {
		this.config.indent = config.indent || 4
		this.config.codeHighlightFn = config.codeHighlightFn || null
	}

	t(lines) {
		const lexer = new Lexer(lines)
		return lexer.run()
	}

	h(lines) {
		const lexer = new Lexer(lines)
		const parser = new Parser(lexer.run(), { config: this.config })
		return parser.run()
	}
}
