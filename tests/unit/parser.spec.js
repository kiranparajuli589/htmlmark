import { Lexer } from "../../lib/lexer"
import { Parser } from "../../lib/parser"
import { commonTokensList } from "../fixtures/commTokens.js"


function toHtml(lines) {
	const lexer = new Lexer(lines)
	const lex = lexer.run()
	const parser = new Parser(lex)
	return parser.run()
}

describe("Parser", () => {
	describe("newline", () => {
		it.each([
			[""],
			["\n"],
			["", "\n"]

		])("should not include the top empty lines", (lines) => {
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it.each(["", "\n"])("should include the empty line after some content", (eLine) => {
			const lines = [
				"some plain text",
				eLine
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should combine multiple consequest new lines to a single one", () => {
			const lines = [
				"some plain text",
				"\n",
				"",
				"some more plain text"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
	})
	describe("comment", () => {
		it("should add a comment", () => {
			const lines = [
				"one",
				"<!-- comment -->",
				"three"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
	})
	describe("codeblock", () => {
		it("should parse the codeblock", () => {
			const lines = [
				"```js",
				"const a = 1",
				"```"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should parse the codeblock without the language", () => {
			const lines = [
				"```",
				"const a = 1",
				"```"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should parse the codeblock with multiple lines", () => {
			const lines = [
				"```js",
				"const a = 1",
				"const b = 2",
				"```"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should parse the codeblock with multiple lines and a newline", () => {
			const lines = [
				"```js",
				"const a = 1",
				"const b = 2",
				"",
				"const c = 3",
				"```"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should parse multiple consequetive codeblocks", () => {
			const lines = [
				"```js",
				"const a = 1",
				"```",
				"```js",
				"const b = 2",
				"```"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should cope with multiple items", () => {
			const lines = [
				"```js",
				"const a = 1",
				"```",
				"some people are funny"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should parse indent codeblock", () => {
			const lines = [
				"This is a normal paragraph:",
				"",
				"    This is a code block.",
				"",
				"Here is an example of AppleScript:",
				"",
				"    tell application \"Foo\"",
				"    beep",
				"    end tell",
				"",
				"A code block continues until it reaches a line that is not indented",
				"(or the end of the article)."
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
	})
	describe("common tokens", () => {
		it.each(commonTokensList)("should parse the common tokens", (line) => {
			const lines = [line]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it.each(commonTokensList)("should parse the common tokens with some space before", (line) => {
			const indent = "  "
			const lines = [indent + line]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
	})
	describe("quote", () => {
		it("should parse multiline quote with the same depth and indent", () => {
			const lines = [
				"> > > zero f",
				"> > one f",
				">>>",
				"> one",
				"> # two",
				"> > three",
				"> > > four",
				"> > > > d-five",
				"> > # five",
				"> > ## six",
				"> > > > seven",
				"simple para"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should detect the circular quote", () => {
			const lines = [
				"> one",
				"> > two",
				"> > > three",
				"> > > > four",
				"> > > > > five",
				"> >>>",
				"> >>> four",
				"> >>",
				"> >> three",
				"> >",
				"> > two",
				">",
				"> one"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it.each([
			"> quote **one** with *two*",
			"  > quote `four` with ~~five~~",
			"> quote [link-title](link-url) with *two*"
		])("should deep tokenize quote with zero depth", (line) => {
			const html = toHtml([line])
			expect(html).toMatchSnapshot()
		})
		it.each([
			"> > quote **one** with *two*",
			"  > > > quote `four` with ~~five~~",
			"> > > > quote [link-title](link-url) with *two*"
		])("should deep tokenize quote with multiple depth", (line) => {
			const html = toHtml([line])
			expect(html).toMatchSnapshot()
		})
		it("should parse the quote with list inside", () => {
			const lines = [
				"> - one",
				"> - two"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should find the list and codeblock inside", () => {
			const lines = [
				"> ## This is a header.",
				">",
				"> 1.   This is the first list item.",
				"> 2.   This is the second list item.",
				">",
				"> Here's some example code:",
				">",
				">     return shell_exec(\"echo $input | $markdown_script\");"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
	})
	describe("list", () => {
		it("should tokenize a valid ordered list", () => {
			const lines = [
				"1. item **1**",
				"1. item [link](link-url)",
				"1. item 3 `code item`"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should tokenize a valid un-ordered list", () => {
			const lines = [
				"- item **1**",
				"- item [link](link-url)",
				"- item 3 `code item`"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should detect list indent", () => {
			const lines = [
				"  - item **1**",
				"  - item [link](link-url)",
				"  - item 3 `code item`"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("indent should break the list", () => {
			const lines = [
				"- item **1**",
				"- item [link](link-url)",
				"    - item 3 `code item`",
				"        - item 4",
				"    - item 3 `code item`"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should tokenize list combination", () => {
			const lines = [
				"- one",
				"- two",
				"1. one",
				"2. two",
				"- [ ] c empty",
				"- [x] c checked",
				"1. [ ] c empty",
				"1. [x] c checked"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should parse the indented codeblock inside", () => {
			const lines = [
				"To put a code block within a list item, the code block needs",
				"to be indented *twice* -- 8 spaces or two tabs:",
				"*   A list item with a code block:",
				"",
				"        <code goes here>",
				"        <code goes here>",
				"        <code goes here>",
				"",
				"### Code Blocks"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
	})
	describe("hr line", () => {
		it.each([
			"---",
			"--",
			"-----"
		])("should parse the hr line", (line) => {
			const lines = [
				line
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
		it("should not allow multiple consecutive hr lines", () => {
			const lines = [
				"---",
				"---"
			]
			const html = toHtml(lines)
			expect(html).toMatchSnapshot()
		})
	})
	describe("table", () => {
		describe("is not a table", () => {
			it("only header", () => {
				const html = toHtml([
					"| column 1 | column 2 |"
				])
				expect(html).toMatchSnapshot()
			})
			it("only header and separator", () => {
				const html = toHtml([
					"| column 1 | column 2 |",
					"|---|---|"
				])
				expect(html).toMatchSnapshot()
			})
			it("false separator", () => {
				const html = toHtml([
					"| column 1 | column 2 |",
					"| - | - |",
					"| row 1 c1 | row 1 c2 |"
				])
				expect(html).toMatchSnapshot()
			})
			it("not consistent cell count", () => {
				const lines = [
					"| column 1 | column 2 |",
					"| --- |",
					"| row 1 c1 | row 1 c2 |"
				]
				const html = toHtml(lines)
				expect(html).toMatchSnapshot()
			})
			it("other tokens in between 1", () => {
				const html = toHtml([
					"| column 1 | column 2 |",
					"",
					"|---|---|",
					"| row 1 c1 | row 1 c2 |"
				])
				expect(html).toMatchSnapshot()
			})
			it("other tokens in between 2", () => {
				const html = toHtml([
					"| column 1 | column 2 |",
					"|---|---|",
					"",
					"| row 1 c1 | row 1 c2 |"
				])
				expect(html).toMatchSnapshot()
			})
			it("other tokens in between 3", () => {
				const html = toHtml([
					"| column 1 | column 2 |",
					"|---|---|",
					"| row 1 c1 | row 1 c2 |",
					"",
					"| row 2 c1 | row 2 c2 |"
				])
				expect(html).toMatchSnapshot()
			})
		})
		describe("table indent", () => {
			it("different indent header -> separator", () => {
				const html = toHtml([
					"| column 1 | column 2 |",
					"    |---|---|",
					"| row 1 c1 | row 1 c2 |"
				])
				expect(html).toMatchSnapshot()
			})

			it("different indent header, separator -> body row", () => {
				const html = toHtml([
					"    | column 1 | column 2 |",
					"    |---|---|",
					"| row 1 c1 | row 1 c2 |"
				])
				expect(html).toMatchSnapshot()
			})

			it("the indented table", () => {
				const html = toHtml([
					"  | column 1 | column 2 |",
					"  |---|---|",
					"  | row 1 c1 | row 1 c2 |"
				])
				expect(html).toMatchSnapshot()
			})

			it("acceptable indent should not break the table 1", () => {
				const html = toHtml([
					"  | column 1 | column 2 |",
					"  |---|---|",
					"  | row 1 c1 | row 1 c2 |",
					"| row 2 c1 | row 2 c2 |"
				])
				expect(html).toMatchSnapshot()
			})
			it("indent should break the table 2", () => {
				const html = toHtml([
					"| column 1 | column 2 |",
					"|---|---|",
					"| row 1 c1 | row 1 c2 |",
					"    | column 1 | column 2 |",
					"    |---|---|",
					"    | row 1 c1 | row 1 c2 |"
				])
				expect(html).toMatchSnapshot()
			})
		})

		describe("table cell count", () => {
			it("cell count should break the table 1", () => {
				const html = toHtml([
					"| column 1 | column 2 |",
					"|---|---|",
					"| row 1 c1 | row 1 c2 |",
					"| row 2 c1 |"
				])
				expect(html).toMatchSnapshot()
			})
			it("cell count should break the table 2", () => {
				const html = toHtml([
					"| column 1 | column 2 |",
					"|---|---|",
					"| row 1 c1 | row 1 c2 |",
					"| column 1 |",
					"|---|",
					"| row 1 c1 |"
				])
				expect(html).toMatchSnapshot()
			})
		})
		describe("table heading-body separator", () => {
			it.each([
				"|-------|-------|",
				"|:-------:|:---------:|"
			])("should parse a table", (line) => {
				const html = toHtml([
					"| column 1 | column 2 |",
					line,
					"| row 1 c1 | row 1 c2 |",
					"| row 2 c1 | row 2 c2 |"
				])
				expect(html).toMatchSnapshot()
			})
		})
	})
	describe("paragraph", () => {
		it.each([
			"some normal and **bold with * gem** but pure *italics* is alos there baby now ~~coming~~hola amigons~~strike~~ wooo lala what about blazing *********here baby ~~~~~~~~~baby `baby```[[[[[[[[[[[[[[[l]]]]int](href)[link](href)``````````",
			"a paragraph of <u>words</u> `first code` normal text here `code body` *first italics* here me crying *italic body* here me crying **first bolds** some normal again **bold body** [Kiran Parajuli](https://kiranparajuli.com.np) ~~strikes body~~ here some",
			"now with __underlined text__ within some ___underl_ined_text___"
		])("should be deep tokenized", (line) => {
			const lines = [line]
			const lexerData = toHtml(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("bold", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"**first bold** **second bold** **third bold**"
			]
			const lexerData = toHtml(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should be deep tokenized", () => {
			const lines = [
				"**bold with `code` and *italics* and ~~strikes~~ and [link](https://kiranparajuli.com.np)**"
			]
			const lexerData = toHtml(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("italics", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"*first italics* *second italics* *third italics*"
			]
			const lexerData = toHtml(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should be deep tokenized", () => {
			const lines = [
				"*italics with `code` and ~~strikes~~ and [link](https://kiranparajuli.com.np)*"
			]
			const lexerData = toHtml(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("strikes", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"~~first strikes~~ ~~second strikes~~ ~~third strikes~~"
			]
			const lexerData = toHtml(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should be deep tokenized", () => {
			const lines = [
				"~~strikes with ~ gem and `code` and **bold** and *italics* and [link](https://kiranparajuli.com.np)~~"
			]
			const lexerData = toHtml(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("code", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"`first code` `second code` `third code`"
			]
			const lexerData = toHtml(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should not be deep tokenized", () => {
			const lines = [
				"`code with ~ gem and **bold** and *italics* and [link](https://kiranparajuli.com.np)`"
			]
			const lexerData = toHtml(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should not panic with angles inside", () => {
			const lines = [
				"Pre-formatted code blocks are used for writing about programming or " +
				"markup source code. Rather than forming normal paragraphs, the lines " +
				"of a code block are interpreted literally. Markdown wraps a code block " +
				"in both `<pre>` and `<code>` tags."
			]
			const lexerData = toHtml(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("link", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"[link](https://kiranparajuli.com.np) [link](https://kiranparajuli.com.np)"
			]
			const lexerData = toHtml(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should deep tokenized the link title", () => {
			const lines = [
				"[*italic* with **bold** and `code`](https://kiranparajuli.com.np)"
			]
			const lexerData = toHtml(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
})
