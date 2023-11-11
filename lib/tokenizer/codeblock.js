import REGEX from "../regex/index.js"
import { Indent, TOKENS, Utils, Esc } from "../util/index.js"


class CodeBlock {
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
	#indentObj

	static tokenName = TOKENS.CODE_BLOCK

	/**
	 * Checks if the given text is of the CodeBlock type
	 *
	 * @returns {boolean}
	 */
	static test({ line, indent, fromToken, lastLexer }) {
		if (
			!fromToken &&
			indent >= 4 &&
			(!lastLexer || lastLexer.type === TOKENS.NEW_LINE)
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

		return CodeBlock.testRegex(line)
	}

	/**
	 * Checks if the given string matches the CodeBlock regex
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
	 * @param {Object} indentObj - Indentation object
	 * @param {Number} indent - Calculated Indent of the text
	 * @param {Number} rawIndent - Raw indent of the text
	 *
	 * @returns {CodeBlock}
	 */
	constructor(lines, cursor, indentObj, indent, rawIndent) {
		this.#lines = lines
		this.#cursor = cursor
		this.#start = cursor
		this.#indentObj = indentObj
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
			if (nextLine === "") {
				continue
			}
			nextLineIndent = (nextLine) ? this.#indentObj.get(nextLine) : null

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
	 * @returns {{
	 * cursor: number,
	 * lexer: {
	 * 		type: string,
	 * 		indent: number,
	 * 		language: string|null,
	 * 		value: string,
	 * 		raw: string
	 * }}}
	 */
	tokenize() {
		this.#findEnd()

		this.#setBody()

		this.#setRaw()

		return {
			cursor: this.#cursor - 1,
			lexer: {
				type: TOKENS.CODE_BLOCK,
				indent: this.#indent,
				language: this.#lang || null,
				value: this.#body,
				raw: this.#raw
			}
		}
	}

	/**
	 * returns HTML for code block
	 *
	 * Format: <pre><code>{body}</code></pre>
	 *
	 * @param {Object} lexer - the CodeBlock lexer
	 * @param {Function|null} highlightFn - A function to highlight code blocks
	 *
	 * @returns {string} - the CodeBlock HTML
	 */
	static parse(lexer, highlightFn = null) {
		let skeleton = `<pre><code%class>
  %s
</code></pre>
`
		if (lexer.language) {
			skeleton = skeleton.replace("%class", ` class='language-${lexer.language}'`)
		} else {
			skeleton = skeleton.replace("%class", "")
		}
		if (highlightFn) {
			const highlightedCode = highlightFn(lexer.value, lexer.language)
			if (typeof highlightedCode === "string") {
				lexer.value = highlightedCode
			} else {
				console.error("highlightFn must return a string")
				console.info("highlightFn was not used")
			}
			skeleton = skeleton.replace("%s", lexer.value)
		} else {
			skeleton = skeleton.replace("%s", Esc.everything(lexer.value))
		}
		return skeleton
	}
}

export default CodeBlock
