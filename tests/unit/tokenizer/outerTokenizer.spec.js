const tokenizer = require("../../../lib/tokenizer/outerTokenizer")
const TOKENS = require("../../../lib/tokenizer/tokens")


const commonTokensList = [
  "# Heading One Text",
  "## Heading Two Text",
  "### Heading Three Text",
  "#### Heading Four Text",
  "##### Heading Five Text",
  "###### Heading Six Text",
  "- list item text",
  "1. count item text",
  "<!-- comment item text -->",
  "- [ ] checkbox item text",
  "- [x] checked checkbox item text",
  "> quote item text",
  "> > quote item text",
  "![alt text](image.png)",
]

describe("outer tokenizer", () => {
  describe("newline", () => {
    it.each([
      [""],
      ["\n"],
      ["", "\n"],

    ])("should not include the top empty lines", (lines) => {
      const tokens = tokenizer(lines)
      expect(tokens).toEqual([])
    })
    it.each(["", "\n"])("should include the empty line after some content", (eLine) => {
      const lines = [
        "some plain text",
        eLine,
      ]
      const tokens = tokenizer(lines)
      expect(tokens.length).toBe(2)
      expect(tokens[1].type).toBe(TOKENS.newLine)
    })
    it("should combine multiple consequest new lines to a single one", () => {
      const lines = [
        "some plain text",
        "\n",
        "",
        "some more plain text",
      ]
      const tokens = tokenizer(lines)
      expect(tokens.length).toBe(3)
      expect(tokens[1].type).toBe(TOKENS.newLine)
    })
  })

  describe("codeblock", () => {
    it("should parse the codeblock", () => {
      const lines = [
        "```js",
        "const a = 1",
        "```",
      ]
      const tokens = tokenizer(lines)
      expect(tokens).toMatchSnapshot()
    })
    it("should parse the codeblock without the language", () => {
      const lines = [
        "```",
        "const a = 1",
        "```",
      ]
      const tokens = tokenizer(lines)
      expect(tokens).toMatchSnapshot()
    })
    it("should parse the codeblock with multiple lines", () => {
      const lines = [
        "```js",
        "const a = 1",
        "const b = 2",
        "```",
      ]
      const tokens = tokenizer(lines)
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
      const tokens = tokenizer(lines)
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
      const tokens = tokenizer(lines)
      expect(tokens).toMatchSnapshot()
    })
  })

  describe("common tokens", () => {
    it.each(commonTokensList)("should parse the common tokens", (line) => { 
      const lines = [line]
      const tokens = tokenizer(lines)
      expect(tokens).toMatchSnapshot()
    })
    it.each(commonTokensList)("should parse the common tokens with some space before", (line) => {
      const indent = "  "
      const lines = [indent + line]
      const tokens = tokenizer(lines)
      expect(tokens[0].indent).toBe(indent)
    })
  })
  describe("paragraph", () => {
    it("should parse a paragarph as it is", () => {
      const lines = [
        "some plain text",
      ]
      const tokens = tokenizer(lines)
      expect(tokens).toMatchSnapshot()
    })
  })
})