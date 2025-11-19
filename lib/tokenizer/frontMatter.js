import { TOKENS, Utils } from "../util/index.js"
import REGEX from "../regex/index.js"


class FrontMatter {
	#body
	#value = {}

	static tokenName = TOKENS.FRONT_MATTER

	constructor(lines) {
		this.#body = lines
	}

	static test(lines) {
		if (Utils.testRegex(lines[0], REGEX.FRONT_MATTER.BOUNDARY)) {
			for (let i = 1; i < lines.length; i++) {
				const line = lines[i]
				if (Utils.testRegex(line, REGEX.FRONT_MATTER.BOUNDARY)) {
					return i + 1
				}
				if (!Utils.testRegex(line, REGEX.FRONT_MATTER.ENTRY)) {
					return -1
				}
			}
		}
		return false
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
						} catch {
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
