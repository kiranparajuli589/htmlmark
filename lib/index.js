import Lexer from "./lexer/index.js"
import Parser from "./parser/index.js"
import { Utils } from "./util/index.js"


class HtmlMark {
	config = {}

	constructor(config = {}) {
		this.config = Utils.prepareConfig(config)
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

export default HtmlMark
