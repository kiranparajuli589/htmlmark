import { REGEX } from "../regex/index.js"


export class Esc {
	static nonTags(str) {
		return str
			.replaceAll("&", "&amp;")
			.replaceAll(REGEX.ESC.LT, "&lt;")
			.replaceAll(REGEX.ESC.GT, "&gt;")
			.replaceAll("\"", "&quot;")
			.replaceAll("'", "&#39;")
	}

	static decodeNonTags(str) {
		return str
			.replaceAll("&amp;", "&")
			.replaceAll("&lt;", "<")
			.replaceAll("&gt;", ">")
			.replaceAll("&quot;", "\"")
			.replaceAll("&#39;", "'")
	}

	static everything(str) {
		return str
			.replaceAll("&", "&amp;")
			.replaceAll(">", "&gt;")
			.replaceAll("<", "&lt;")
			.replaceAll("\"", "&quot;")
			.replaceAll("'", "&#39;")
	}

	static withoutAmps(str) {
		return str
			.replaceAll(">", "&gt;")
			.replaceAll("<", "&lt;")
			.replaceAll("\"", "&quot;")
			.replaceAll("'", "&#39;")
	}
}
