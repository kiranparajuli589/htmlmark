import { Parsers } from "../tokenizer/index.js"
import { TOKENS, Utils } from "../util/index.js"


class Parser {
	#lexers
	#cursor
	#config
	#fromToken
	#currentLexer
	#parsedContent
	#modifiedParsers = {}

	constructor(lexers, { from = null, config = {} } = {}) {
		this.#lexers = lexers
		this.#parsedContent = []
		this.#fromToken = from
		this.#modifiedParsers = {}

		this.#config = Utils.prepareConfig(config)

		this.#modifiedParsers[TOKENS.PARAGRAPH] = this.#parseParagraph.bind(this)
	}

	#parseParagraph() {
		let parsed = Parsers.Paragraph.parse(this.#currentLexer)
		if (this.#fromToken === TOKENS.LIST) {
			this.#parsedContent.push(`${parsed}`)
		} else this.#parsedContent.push(`<p>${parsed}</p>
`)
	}


	#parseCurrentLexer() {
		for (const module in Parsers) {
			if (Parsers[module].tokenName === this.#currentLexer.type) {
				if (this.#modifiedParsers[this.#currentLexer.type]) {
					this.#modifiedParsers[this.#currentLexer.type]()
					return
				}

				if (
					this.#currentLexer.type === TOKENS.CODE_BLOCK &&
					this.#config.highlightFn &&
					typeof this.#config.highlightFn === "function"
				) {
					this.#parsedContent.push(Parsers[module].parse(this.#currentLexer, this.#config.highlightFn))
					return
				}

				this.#parsedContent.push(Parsers[module].parse(this.#currentLexer))
				return
			}
		}
	}

	run() {
		for (this.#cursor=0; this.#cursor<this.#lexers.length; this.#cursor++) {
			this.#currentLexer = this.#lexers[this.#cursor]
			this.#parseCurrentLexer()
		}

		// remove any %s leftovers and return
		return this.#parsedContent
			.map(item => item.replaceAll("%s", ""))
			.join("")
	}
}

export default Parser
