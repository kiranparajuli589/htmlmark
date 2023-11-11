const REGEX = {
	HR_LINE: /^\s*[-+*](?:(?:\s[-+*]){2,}|[-+*]{2,})$/g,
	QUOTE: {
		ITEM: /^\s*(?:>\s*)+(?<value>.+)/g,
		EMPTY: /^\s*[>\s]+$/g,
		COUNT: />/g,
		NON_QUOTE: /[^>\s\t]/
	},
	COMMENT: /^\s*<!-{2}\s(?<value>.+)\s-{2}>/g,
	IMAGE: /^\s*!\[(?<alt>.+)]\((?<url>.+)\)/g,
	HEADING: {
		ITEM: /^\s*(?<level>#{1,6})\s+((?<fenceVal>.+)(?=\s+#+\s*$)|(?<val>.+))/g,
		UNDERLINE_1: /^\s*={3,}$/g,
		UNDERLINE_2: /^\s*-{3,}$/g
	},
	CODE_BLOCK: /^\s*`{3}\s*(?<lang>[a-z]*)$/g,
	LIST: {
		CHECKBOX: /^\s*(?:[-~*]|\d+\.)\s\[(?<check>\s|x)]\s(?<value>.+)/g,
		UNORDERED: /^\s*(?<mark>[-*+])\s(?<value>.+)/g,
		ORDERED: /^\s*(?<count>\d)\.\s(?<value>.+)/g,
		ITEM: /^\s*(?:(?<mark>[-*+])|(?<count>\d+)\.)\s+(\[(?<check>\s|x)]\s+)?(?<value>.+)/g,
		EMPTY: /^\s*(?<mark>[-*+]|(?<count>\d+)\.)(\s\[(?<check>(\s|x))]\s*|\s*)$/g
	},
	PARAGRAPH: {
		LINK: /^\[(?<text>.+?)]\((?<href>\S+)(?:\s['"](?<title>.+)['"])?\)/,
		REF_LINK: /^((?<!!)\[.+?](?!\(.+\))){1,2}/,
		HTML: /^\s*<\/(?<endTag>\w+)>|^\s*<(?<tag>\w+)(?<attrs>\s\w+(=\\?['"].+?['"])?)?>/,
		// eslint-disable-next-line no-useless-escape
		COMPUTED_HTML: "<(?<tag>%s)(?<attrs>\s\w+=\\?['\"].+?['\"])?>(?<content>.+)<\/%s>",
		IMAGE: /^!\[(?<alt>.+)]\((?<href>\S+)(?:\s'(?<title>[^']+)'(\s(?<width>\d+)(\s(?<height>\d+))?)?)?\)/
	},
	HTML: /^\s*<(?<tag>\w+)(?<attrs>\s\w+=\\?['"].+?['"])?>(?<content>.?)/g,
	LINK_REF: {
		DECLARATION: /\s*\[(?<text>.+)]:\s+(?<href>\S+(?:\s'(?<title>.+?)')?)/g,
		WITH_TEXT: /^(?<!!)\[(?<text>.+?)](?!\(.+\))(?<!!)\[(?<ref>.+?)](?!\(.+\))/,
		WITHOUT_TEXT: /^(?<!!)\[(?<ref>.+?)](?!\(.+\))/
	},
	TABLE: {
		ROW: /^\s*(?<!\\)\|(?=(?:.+(?<!\\)\|)+$)|(?!^)(?<cell>.+?)(?<!\\)\|/gy,
		/**
		 * @example |----|-----|------|
		 */
		DASH_LINE: /^\s*\|(?=(?:-{2,}\|)+$)|(?!^)(?<cell>-{2,})\|/gy,
		/**
		 * @example | --- | --- | --- |
		 */
		S_DASH_LINE: /^\s*\|(?=(?:\s-{2,}\s\|)+$)|(?!^)(?<cell>\s-{2,})\s\|/gy,
		/**
		 * @example |:----:|:----:|:----:|
		 */
		COLON_LINE: /^\s*\|(?=(?::-{2,}:\|)+$)|(?!^):(?<cell>-{2,}):\|/gy,
		/**
		 * @example | :---: | :---: | :---: |
		 */
		S_COLON_LINE: /^\s*\|(?=(?:\s:-{2,}:\s\|)+$)|\s(?!^):(?<cell>-{2,}):\s\|/gy,
		CELL: /(?<!\\)(\|)/g
	},
	ESC: {
		GT: /(?<!<\/?\w[^<>]*)>/g,
		LT: /<(?!([a-z/1-6]+>))/g
	},
	ESCAPED: /\\([*_[\]()!~+\\|`#><])/g,
	FRONT_MATTER: {
		BOUNDARY: /^-{3}\s*$/,
		ENTRY: /^\s*(?<key>\w+):\s*(?<value>.*)$/
	},
	NUMBER: /^\d+$/,
	NUMBER_WITH_DECIMAL: /^\d+\.\d+$/,
	BIG_BRACKETED: /^\[.*]$/,
	CURLY_BRACKETED: /^\{.*}$/
}

export default REGEX
