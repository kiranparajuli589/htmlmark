export const REGEX = {
	HR_LINE: /^\s*-{3,}\s*$/g,
	QUOTE: /^\s*(?:>\s*)+(?<value>.+)/g,
	EMPTY_QUOTE: /^\s*[>\s]+$/g,
	COMMENT: /^\s*<!-{2}\s(?<value>.+)\s-{2}>/g,
	IMAGE: /^\s*!\[(?<alt>.+)]\((?<url>.+)\)/g,
	HEADING: {
		ITEM: /^\s*(?<level>#{1,6})\s(?<value>.+)/g,
		EQUAL_TO_LINE: /^\s*(=+)\s*$/g,
		UNDERLINE: /^\s*(-+)\s*$/g
	},
	CODE_BLOCK: /^\s*`{3}(?<lang>[a-z]*)$/g,
	LIST: {
		CHECKBOX: /^\s*(?:[-~*]|\d+\.)\s\[(?<check>\s|x)]\s(?<value>.+)/g,
		UNORDERED: /^\s*(?<mark>[-*+])\s(?<value>.+)/g,
		ORDERED: /^\s*(?<count>\d)\.\s(?<value>.+)/g,
		ITEM: /^\s*(?:(?<mark>[-*+])|(?<count>\d+)\.)\s(\[(?<check>\s|x)]\s)?(?<value>.+)/g
	},
	PARAGRAPH: {
		CODE: /`(?<code>.+?)`(?!`)/g,
		BOLD: /\*\*(?<bold>.+?)\*\*(?!\*)/g,
		ITALIC: /\*(?<italic>.+?)\*(?!\*)/g,
		STRIKE: /~~(?<strike>.+?)~~(?!~)/g,
		UNDERLINE: /__(?<underline>.+?)__(?!_)/g,
		LINK: /\[(?<title>.+?)]\((?<href>.+?)\)/g
	},
	TABLE: {
		ROW: /^\s*\|(?=(?:[^|]+\|)+$)|(?!^)(?<cell>[^|]+)\|/gy,
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
	}
}
