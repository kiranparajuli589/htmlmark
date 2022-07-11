const path = require("path")
const { read } = require("../../lib/util/file")
const lexer = require("../../lib/lexer")
const TOKENS = require("../../lib/util/tokens")


const commonTokensList = [
  "# Heading One Text",
  "## Heading Two Text",
  "### Heading Three Text",
  "#### Heading Four Text",
  "##### Heading Five Text",
  "###### Heading Six Text",
  "<!-- comment item text -->",
  "![alt text](image.png)",
]

describe("lexer", () => {
  describe("newline", () => {
    it.each([
      [""],
      ["\n"],
      ["", "\n"],

    ])("should not include the top empty lines", (lines) => {
      const tokens = lexer(lines)
      expect(tokens).toEqual([])
    })
    it.each(["", "\n"])("should include the empty line after some content", (eLine) => {
      const lines = [
        "some plain text",
        eLine,
      ]
      const tokens = lexer(lines)
      expect(tokens.length).toBe(2)
      expect(tokens[1].type).toBe(TOKENS.NEW_LINE)
    })
    it("should combine multiple consequest new lines to a single one", () => {
      const lines = [
        "some plain text",
        "\n",
        "",
        "some more plain text",
      ]
      const tokens = lexer(lines)
      expect(tokens.length).toBe(3)
      expect(tokens[1].type).toBe(TOKENS.NEW_LINE)
    })
  })

  describe("codeblock", () => {
    it("should parse the codeblock", () => {
      const lines = [
        "```js",
        "const a = 1",
        "```",
      ]
      const tokens = lexer(lines)
      expect(tokens).toMatchSnapshot()
    })
    it("should parse the codeblock without the language", () => {
      const lines = [
        "```",
        "const a = 1",
        "```",
      ]
      const tokens = lexer(lines)
      expect(tokens).toMatchSnapshot()
    })
    it("should parse the codeblock with multiple lines", () => {
      const lines = [
        "```js",
        "const a = 1",
        "const b = 2",
        "```",
      ]
      const tokens = lexer(lines)
      expect(tokens).toMatchSnapshot()
    })
    it("should parse the codeblock with multiple lines and a newline", () => {
      const lines = [
        "```js",
        "const a = 1",
        "const b = 2",
        "",
        "const c = 3",
        "```",
      ]
      const tokens = lexer(lines)
      expect(tokens).toMatchSnapshot()
    })
    it("should parse multiple consequetive codeblocks", () => {
      const lines = [
        "```js",
        "const a = 1",
        "```",
        "```js",
        "const b = 2",
        "```",
      ]
      const tokens = lexer(lines)
      expect(tokens).toMatchSnapshot()
    })
  })

  describe("common tokens", () => {
    it.each(commonTokensList)("should parse the common tokens", (line) => { 
      const lines = [line]
      const tokens = lexer(lines)
      expect(tokens).toMatchSnapshot()
    })
    it.each(commonTokensList)("should parse the common tokens with some space before", (line) => {
      const indent = "  "
      const lines = [indent + line]
      const tokens = lexer(lines)
      expect(tokens[0].indent).toBe(2)
    })
  })
  describe("paragraph", () => {
    it("should be deep tokenized", () => {
      const lines = [
        "a paragraph of words `first code` normal text here `code body` *first italics* here me crying *italic body* here me crying **first bolds** some normal again **bold body** [Kiran Parajuli](https://kiranparajuli.com.np) ~~strikes body~~ here some"
      ]
      const lexerData = lexer(lines)
      expect(lexerData).toMatchSnapshot()
    })
  })
  describe("quote", () => {
    it.each([
      {quote: "> quote 1", expectedDepth: 0},
      {quote: "> > quote 2", expectedDepth: 1},
      {quote: "> > > quote 3", expectedDepth: 2},
      {quote: "> > > > quote 4", expectedDepth: 3},
      {quote: "> > > > > quote 5", expectedDepth: 4},
    ])("should detect the quote depth", ({quote, expectedDepth}) => {
      const tokenizedContent = lexer([quote])
      expect(tokenizedContent[0].depth).toEqual(expectedDepth)
    })
    it.each([
      "> quote **one** with *two*",
      "  > quote `four` with ~~five~~",
      "> quote [link-title](link-url) with *two*",
    ])("should deep tokenize quote with zero depth", (line) => {
      const tokenizedContent = lexer([line])
      expect(tokenizedContent).toMatchSnapshot()
    })
    it.each([
      "> > quote **one** with *two*",
      "  > > > quote `four` with ~~five~~",
      "> > > > quote [link-title](link-url) with *two*",
    ])("should deep tokenize quote with multiple depth", (line) => {
      const tokenizedContent = lexer([line])
      expect(tokenizedContent).toMatchSnapshot()
    })
  })
  describe("list", () => {
    it("should tokenize a valid ordered list", () => {
      const lines = [
        "1. item **1**",
        "1. item [link](link-url)",
        "1. item 3 `code item`",
      ]
      const tokenizedContent = lexer(lines)
      expect(tokenizedContent).toMatchSnapshot()
    })
    it("should tokenize a valid un-ordered list", () => {
      const lines = [
        "- item **1**",
        "- item [link](link-url)",
        "- item 3 `code item`",
      ]
      const tokenizedContent = lexer(lines)
      expect(tokenizedContent).toMatchSnapshot()
    })
    it("should detech list indent", () => {
      const lines = [
        "  - item **1**",
        "  - item [link](link-url)",
        "  - item 3 `code item`",
      ]
      const tokenizedContent = lexer(lines)
      expect(tokenizedContent[0].indent).toEqual(2)
    })
    it("indent should break the list", () => {
      const lines = [
        "  - item **1**",
        "  - item [link](link-url)",
        "- item 3 `code item`",
        "- item 4",
      ]
      const tokenizedContent = lexer(lines)
      expect(tokenizedContent).toMatchSnapshot()
    })
  })
  describe("hr line", () => {
    it("should parse the hr line", () => {
      const lines = [
        "---",
      ]
      const tokens = lexer(lines)
      expect(tokens).toMatchSnapshot()
      expect(tokens[0].type).toBe(TOKENS.HR_LINE)
    })
    it("should not allow multiple consecutive hr lines", () => {
      const lines = [
        "---",
        "---",
      ]
      const tokens = lexer(lines)
      expect(tokens.length).toBe(1)
      expect(tokens[0].type).toBe(TOKENS.HR_LINE)
    })
  })
  describe("table", () => {
    describe("is not a table", () => {
      it("only header", () => {
        const tokens = lexer([
          "| column 1 | column 2 |",
        ])
        expect(tokens).toMatchSnapshot()
      })
      it("only header and separator", () => {
        const tokens = lexer([
          "| column 1 | column 2 |",
          "|---|---|",
        ])
        expect(tokens).toMatchSnapshot()
      })
      it("false separator", () => {
        const tokens = lexer([
          "| column 1 | column 2 |",
          "| --- | --- |",
          "| row 1 c1 | row 1 c2 |",
        ])
        expect(tokens).toMatchSnapshot()
      })
      it("other tokens in between 1", () => {
        const tokens = lexer([
          "| column 1 | column 2 |",
          "",
          "|---|---|",
          "| row 1 c1 | row 1 c2 |",
        ])
        expect(tokens).toMatchSnapshot()
      })
      it("other tokens in between 2", () => {
        const tokens = lexer([
          "| column 1 | column 2 |",
          "|---|---|",
          "",
          "| row 1 c1 | row 1 c2 |",
        ])
        expect(tokens).toMatchSnapshot()
      })
      it("other tokens in between 3", () => {
        const tokens = lexer([
          "| column 1 | column 2 |",
          "|---|---|",
          "| row 1 c1 | row 1 c2 |",
          "",
          "| row 2 c1 | row 2 c2 |",
        ])
        expect(tokens).toMatchSnapshot()
      })
    })
    describe("table indent", () => {
      it("different indent header -> separator", () => {
        const tokens = lexer([
          "| column 1 | column 2 |",
          "  |---|---|",
          "| row 1 c1 | row 1 c2 |",
        ])
        expect(tokens).toMatchSnapshot()
      })

      it("different indent header, separator -> body row", () => {
        const tokens = lexer([
          "  | column 1 | column 2 |",
          "  |---|---|",
          "| row 1 c1 | row 1 c2 |",
        ])
        expect(tokens).toMatchSnapshot()
      })

      it("the indented table", () => {
        const tokens = lexer([
          "  | column 1 | column 2 |",
          "  |---|---|",
          "  | row 1 c1 | row 1 c2 |",
        ])
        expect(tokens).toMatchSnapshot()
      })

      it("indent should break the table 1", () => {
        const tokens = lexer([
          "  | column 1 | column 2 |",
          "  |---|---|",
          "  | row 1 c1 | row 1 c2 |",
          "| row 2 c1 | row 2 c2 |",
        ])
        expect(tokens).toMatchSnapshot()
      })
      it("indent should break the table 2", () => {
        const tokens = lexer([
          "  | column 1 | column 2 |",
          "  |---|---|",
          "  | row 1 c1 | row 1 c2 |",
          "| column 1 | column 2 |",
          "|---|---|",
          "| row 1 c1 | row 1 c2 |",
        ])
        expect(tokens).toMatchSnapshot()
      })
    })
    describe("table heading-body separator", () => {
      it.each([
        "|-------|-------|",
        "|:-------:|:---------:|",
      ])("should parse a table", (line) => {
        const tokens = lexer([
          "| column 1 | column 2 |",
          line,
          "| row 1 c1 | row 1 c2 |",
          "| row 2 c1 | row 2 c2 |",
        ])
        expect(tokens).toMatchSnapshot()
      })
    })
  })
  it("should tokenize a markdown content", () => {
    // eslint-disable-next-line no-undef
    const fileContent = read(path.join(__dirname, "..", "fixtures", "markdown.md")).split("\n")
    expect(lexer(fileContent)).toMatchSnapshot()
  })
})