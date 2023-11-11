import { TOKENS, Utils } from "../util/index.js"
import REGEX from "../regex/index.js"


class FrontMatter {
	#lines
	#endLine
	#body
	#value = {}

	static tokenName = TOKENS.FRONT_MATTER

	constructor(lines) {
		this.#lines = lines
		this.findEnd()
	}

	static test(lines) {
		if (Utils.testRegex(lines[0], REGEX.FRONT_MATTER.BOUNDARY)) {
			for (let i = 1; i < lines.length; i++) {
				const line = lines[i]
				if (Utils.testRegex(line, REGEX.FRONT_MATTER.BOUNDARY)) {
					return true
				}
				if (!Utils.testRegex(line, REGEX.FRONT_MATTER.ENTRY)) {
					return false
				}
			}
		}
		return false
	}

	findEnd() {
		for (let i = 1; i < this.#lines.length; i++) {
			if (Utils.testRegex(this.#lines[i], REGEX.FRONT_MATTER.BOUNDARY)) {
				this.#endLine = i + 1
			}
		}
		this.#body = this.#lines.slice(1, this.#endLine - 1)
	}

	removeFrontMatterFromGivenLines() {
		return this.#lines.slice(this.#endLine + 1)
	}

	getValue() {
		for (let i = 0; i < this.#body.length; i++) {
			const line = this.#body[i]
			if (Utils.testRegex(line, REGEX.FRONT_MATTER.ENTRY)) {
				const match = Utils.execRegex(line, REGEX.FRONT_MATTER.ENTRY)
				if (match) {
					let keyValue = match.groups.value
					if (["true", "false"].includes(keyValue.toLowerCase())) {
						keyValue = keyValue.toLowerCase() === "true"
					} else if (REGEX.NUMBER.test(keyValue)) {
						keyValue = parseInt(keyValue)
					} else if (REGEX.NUMBER_WITH_DECIMAL.test(keyValue)) {
						keyValue = parseFloat(keyValue)
					} else if (REGEX.BIG_BRACKETED.test(keyValue) || REGEX.CURLY_BRACKETED.test(keyValue)) {
						try {
							keyValue = JSON.parse(keyValue)
						} catch (e) {
							// do nothing
						}
					}
					this.#value[match.groups.key] = keyValue
				}
			}
		}
		return this.#value
	}
}

export default FrontMatter