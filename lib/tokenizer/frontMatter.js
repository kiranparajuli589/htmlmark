import { Utils } from "../util/utils.js"
import { TOKENS } from "../util/tokens.js"


export class FrontMatter {
	static tokenName = TOKENS.FRONT_MATTER
	#lines
	#endLine
	#body
	#value = {}
	constructor(lines) {
		this.#lines = lines
	}
	checkIfPresent() {
		const lines = this.#lines
		const firstLine = lines[0]
		const regex = /^---\s*$/
		if (Utils.testRegex(firstLine, regex)) {
			for (let i = 1; i < lines.length; i++) {
				const line = lines[i]
				if (Utils.testRegex(line, regex)) {
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
			const regex = /^\s*(?<key>\w+):\s*(?<value>.*)$/
			if (Utils.testRegex(line, regex)) {
				const match = Utils.execRegex(line, regex)
				if (match) {
					let keyValue = match.groups.value
					if (["true", "false"].includes(keyValue.toLowerCase())) {
						keyValue = keyValue.toLowerCase() === "true"
					} else if (/^\d+$/.test(keyValue)) {
						keyValue = parseInt(keyValue)
					} else if (/^\d+\.\d+$/.test(keyValue)) {
						keyValue = parseFloat(keyValue)
					} else if (/^\[.*]$/.test(keyValue) || /^\{.*}$/.test(keyValue)) {
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
