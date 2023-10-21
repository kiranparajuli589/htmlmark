import { Utils } from "../util/utils.js"
import { TOKENS } from "../util/tokens.js"
import { REGEX } from "../regex/index.js"


export class FrontMatter {
	#lines
	#endLine
	#body
	#value = {}

	static tokenName = TOKENS.FRONT_MATTER

	constructor(lines) {
		this.#lines = lines
	}
	checkIfPresent() {
		const lines = this.#lines
		const firstLine = lines[0]
		if (Utils.testRegex(firstLine, REGEX.FRONT_MATTER.BOUNDARY)) {
			for (let i = 1; i < lines.length; i++) {
				const line = lines[i]
				if (Utils.testRegex(line, REGEX.FRONT_MATTER.BOUNDARY)) {
					this.#endLine = i + 1
					this.#body = lines.slice(1, i)
					return true
				}
			}
		}
		return false
	}
	getUpdatedLines() {
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
