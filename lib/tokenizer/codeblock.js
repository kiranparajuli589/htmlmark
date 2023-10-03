import { REGEX } from "../regex/index.js"
import { Indent } from "../util/indent.js"
import { TOKENS } from "../util/tokens.js"
import { Utils } from "../util/utils.js"
import { Esc } from "../util/esc.js"


export class CodeBlock {
	#lines
	#start
	#cursor
	#indent
	#rawIndent
	#withBraces
	#lang
	#body
	#raw
	#isBroken = false

	/**
	 * Checks if the given text is of the CodeBlock type
	 *
	 * @param {String} text - Text to be checked
	 * @param {Number} indent - Indent of the text
	 * @param {String|null} fromToken - Token from which the text is being checked
	 * @param {Object} lastLexer - Last lexer object
	 *
	 * @returns {boolean}
	 */
	static test(text, indent, fromToken, lastLexer) {
		if (
			!fromToken &&
			indent >= 4 &&
			(!lastLexer || lastLexer?.type === TOKENS.NEW_LINE)
		) {
			return true
		}

		// under deep condition inside list item
		// cb needs to be indented at least twice
		if (
			fromToken === TOKENS.LIST_ITEM && indent >= 8 &&
			(!lastLexer || lastLexer?.type === TOKENS.NEW_LINE)
		) {
			return true
		}


		// under deep condition inside quote
		// cb needs regular indentation

		if (
			fromToken === TOKENS.QUOTE && indent >= 4 &&
			(!lastLexer || lastLexer?.type === TOKENS.NEW_LINE)
		) {
			return true
		}

		return CodeBlock.testRegex(text)
	}

	/**
	 * Checks if the given string matches the CodeBlock regex
	 * REGEX: /^\s*`{3}(?<lang>[a-z]*)$/g
	 *
	 * @param {String} text - Text to be checked
	 *
	 * @returns {boolean}
	 */
	static testRegex(text) {
		return Utils.testRegex(text.trimEnd(), REGEX.CODE_BLOCK)
	}

	/**
	 * Returns the CodeBlock regex match for the given text
	 *
	 * @param {String} text - Text to be checked
	 *
	 * @returns {RegExpExecArray}
	 */
	static matchRegex(text) {
		return Utils.execRegex(text.trimEnd(), REGEX.CODE_BLOCK)
	}

	/**
	 * The CodeBlock Tokenizer Constructor
	 *
	 * @param {String[]} lines - Lines of the text
	 * @param {Number} cursor - Cursor position to start from
	 * @param {Number} indent - Calculated Indent of the text
	 * @param {Number} rawIndent - Raw indent of the text
	 *
	 * @returns {CodeBlock}
	 */
	constructor(lines, cursor, indent, rawIndent) {
		this.#lines = lines
		this.#cursor = cursor
		this.#start = cursor
		this.#indent = indent
		this.#rawIndent = rawIndent
		this.#withBraces = CodeBlock.testRegex(lines[cursor])
		this.#lang = CodeBlock.matchRegex(lines[cursor])?.groups?.lang || null
	}

	/**
	 * Finds the end of the CodeBlock
	 *
	 * Checks if the CodeBlock is broken or not
	 */
	#findEnd() {
		let nextLine, nextLineIndent, nextLineMatch, isNextLineClosingOne

		do {
			nextLine = this.#lines[++this.#cursor]
			nextLineIndent = (nextLine) ? Indent.get(nextLine) : null

			if (nextLine !== undefined) {
				if (this.#withBraces) {
					nextLineMatch = nextLine.trim() === "```"
					if (
						nextLineMatch &&
						nextLineIndent === this.#indent
					) {
						isNextLineClosingOne = true
					}
				}
			}

			if (!isNextLineClosingOne) {
				if (nextLineIndent < this.#indent) {
					isNextLineClosingOne = true
					if (this.#withBraces) this.#isBroken = true
				}
			}

		} while (
			nextLine !== undefined &&
			!isNextLineClosingOne
		)
	}

	/**
	 * Sets the CodeBlock body
	 */
	#setBody() {
		const start = (this.#withBraces) ? this.#start + 1 : this.#start

		this.#body = this.#lines.slice(start, this.#cursor)
			.map(line => line.slice(Math.min(this.#rawIndent, Indent.raw(line))))
			.join("\n")
	}

	/**
	 * Sets the CodeBlock raw body
	 */
	#setRaw() {
		let endRaw
		if (this.#withBraces) {
			endRaw = this.#cursor + 1
			if (this.#isBroken) endRaw = this.#cursor
		} else endRaw = this.#cursor
		this.#raw = this.#lines.slice(this.#start, endRaw).join("\n")
		this.#cursor = endRaw
	}

	/**
	 * Tokenizes the lines for the CodeBlock token
	 *
	 * @returns {{cursor: number, raw, language, body}}
	 */
	tokenize() {
		this.#findEnd()

		this.#setBody()

		this.#setRaw()

		return {
			language: this.#lang,
			body: Esc.everything(this.#body),
			cursor: this.#cursor - 1,
			raw: this.#raw
		}
	}

	/**
	 * returns HTML for code block
	 *
	 * Format: <pre><code>{body}</code></pre>
	 *
	 * @param {Object} lexer - the CodeBlock lexer
	 * @param {Function|null} codeHighlightFn - A function to highlight code blocks
	 *
	 * @returns {string} - the CodeBlock HTML
	 */
	static parse(lexer, codeHighlightFn = null) {
		let skeleton = `<pre><code%class>%s</code></pre>
`
		if (lexer.language) {
			skeleton = skeleton.replace("%class", ` class='language-${lexer.language}'`)
		} else {
			skeleton = skeleton.replace("%class", "")
		}
		if (codeHighlightFn) {
			const highlightedCode = codeHighlightFn(Esc.decode(lexer.value), lexer.language)
			if (typeof highlightedCode === "string") {
				lexer.value = highlightedCode
			} else {
				console.error("codeHighlightFn must return a string")
				console.info("codeHighlightFn was not used")
			}
		}
		skeleton = skeleton.replace("%s", lexer.value)

		return skeleton
	}
}
