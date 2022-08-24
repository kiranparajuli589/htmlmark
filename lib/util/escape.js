export class Escape {
	static nonTags(str) {
		return str
			.replaceAll("&", "&amp;")
			.replaceAll("/<(?![a-z\\/])/g", "&lt;")
			.replaceAll("/(?<!<\\/?\\w[^<>]*)>/g", "&gt;")
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
}
