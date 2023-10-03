import { REGEX } from "../regex/index.js"
import { Utils } from "./utils.js"


export class Esc {
	static nonTags(str) {
		return str
			.replaceAll("&", "&amp;")
			.replaceAll(REGEX.ESC.LT, "&lt;")
			.replaceAll(REGEX.ESC.GT, "&gt;")
			.replaceAll("\"", "&quot;")
			.replaceAll("'", "&#39;")
	}

	static everything(str) {
		return str
			.replaceAll("&", "&amp;")
			.replaceAll(">", "&gt;")
			.replaceAll("<", "&lt;")
			.replaceAll("\"", "&quot;")
			.replaceAll("'", "&#39;")
	}

	static decode(str) {
		return str
			.replaceAll("&amp;", "&")
			.replaceAll("&gt;", ">")
			.replaceAll("&lt;", "<")
			.replaceAll("&quot;", "\"")
			.replaceAll("&#39;", "'")
	}

	static unEscape(str) {
		if (Utils.testRegex(str, REGEX.ESCAPED)) {
			str = str.replaceAll(REGEX.ESCAPED, "$1")
		}
		return str
	}
}
