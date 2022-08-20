import { REGEX } from "../regex/index.js"
import { Indent } from "../util/indent.js"
import { Parser } from "../parser/index.js"
import { TOKENS } from "../util/tokens.js"


export class CodeBlock {
	static testRegex(text) {
		REGEX.CODE_BLOCK.lastIndex = 0
		return REGEX.CODE_BLOCK.test(text.trimEnd())
	}

	static matchRegex(text) {
		REGEX.CODE_BLOCK.lastIndex = 0
		return REGEX.CODE_BLOCK.exec(text.trimEnd())
	}

	static getTheEnd(lines, cursor, indent, blockType) {
		let end = cursor

		let nextLine, nextLineIndent, nextLineMatch, isNextLineClosingOne
		let isBroken = false

		do {
			nextLine = lines[++end]
			nextLineIndent = (nextLine) ? Indent.get(nextLine) : null

			if (nextLine !== undefined) {
				if (blockType) {
					nextLineMatch = nextLine.trim() === "```"
					if (
						nextLineMatch &&
						nextLineIndent === indent
					) {
						isNextLineClosingOne = true
					}
				}
			}

			if (!isNextLineClosingOne) {
				if (nextLineIndent < indent) {
					isNextLineClosingOne = true
					if (blockType) isBroken = true
				}
			}

		} while (
			nextLine !== undefined &&
			!isNextLineClosingOne
		)

		return { end, isBroken }
	}
	static test(text, indent, deep, lastLexer) {
		if (
			!deep &&
			indent >= 4 &&
			(!lastLexer || lastLexer?.type === TOKENS.NEW_LINE)
		) {
			return true
		}
		return CodeBlock.testRegex(text)
	}
	static tokenize(lines, cursor, indent, rawIndent) {
		const blockType = CodeBlock.testRegex(lines[cursor])
		const language = CodeBlock.matchRegex(lines[cursor])?.groups?.lang || null
		const { end, isBroken } = this.getTheEnd(lines, cursor, indent, blockType)

		const start = (blockType) ? cursor + 1 : cursor

		const body = lines.slice(start, end)
			.map(line => line.slice(Math.min(rawIndent, Indent.raw(line))))
			.join("\n")


		let endRaw
		if (blockType) {
			endRaw = end + 1
			if (isBroken) endRaw = end
		} else endRaw = end
		const raw = lines.slice(cursor, endRaw).join("\n")

		return {
			language,
			body,
			cursor: endRaw - 1,
			raw
		}
	}

	/**
	 * returns HTML for code block
	 *
	 * @param {Object} lexer
	 *
	 * @returns {string}
	 */
	static parse(lexer) {
		let skeleton = `
<pre><code%class>%s</code></pre>
`
		if (lexer.language) {
			skeleton = skeleton.replace("%class", ` class='language-${lexer.language}'`)
		} else {
			skeleton = skeleton.replace("%class", "")
		}
		return skeleton.replace("%s", Parser.parseContent(lexer))
	}
}
