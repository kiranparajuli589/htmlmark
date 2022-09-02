export const REGEX = {
	HR_LINE: /^\s*-{3,}$|^\*{3,}\s*$/g,
	QUOTE: {
		ITEM: /^\s*(?:>\s*)+(?<value>.+)/g,
		EMPTY: /^\s*[>\s]+$/g
	},
	COMMENT: /^\s*<!-{2}\s(?<value>.+)\s-{2}>/g,
	IMAGE: /^\s*!\[(?<alt>.+)]\((?<url>.+)\)/g,
	HEADING: {
		ITEM: /^\s*(?<level>#{1,6})\s+((?<fenceVal>.+)(?=\s+#+\s*$)|(?<val>.+))/g,
		UNDERLINE_1: /^\s*=+$/g,
		UNDERLINE_2: /^\s*-+$/g
	},
	CODE_BLOCK: /^\s*`{3}(?<lang>[a-z]*)$/g,
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
		IMAGE: /^!\[(?<alt>.+)]\((?<href>\S+)(?:\s'(?<title>[^']+)'(\s(?<width>\d+)(\s(?<height>\d+))?)?)?\)/
	},
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
		S_COLON_LINE: /^\s*\|(?=(?:\s:-{2,}:\s\|)+$)|\s(?!^):(?<cell>-{2,}):\s\|/gy
	},
	ESC: {
		GT: /(?<!<\/?\w[^<>]*)>/g,
		LT: /<(?!([a-z/1-6]+>))/g
	},
	ESCAPED: /\\([*_[\]()!~+\\|`])/g
}
