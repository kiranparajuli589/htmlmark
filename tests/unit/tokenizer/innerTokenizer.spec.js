const outerTokenizer = require("../../../lib/tokenizer/outerTokenizer")
const innerTokenizer = require("../../../lib/tokenizer/innerTokenizer")

describe("inner tokenizer", () => {
    describe("no deep tokenization (newline, codeblock, comment, image)", () => {
        it.each([
            ["some code", ""],
            ["some code", "\n"]
          ])("should not deep tokenize new lines", (lines) => {
            const tokenizedContent = outerTokenizer(lines)
            const deepTokenizedContent = innerTokenizer(tokenizedContent)
            expect(deepTokenizedContent[1]).toEqual(tokenizedContent[1])
          })
          it.each([
            [
                // codeblock
                "```js",
                "const a = 1",
        
                "const b = 2",
                "```",
            ],
            ["<!-- some comment -->"], // comment
            ["![alt text](urlpart)"] // image
          ])("should not tokenize", (lines) => {
            const tokenizedContent = outerTokenizer(lines)
            const result = innerTokenizer(tokenizedContent)
            expect(result).toEqual(tokenizedContent)
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
            const tokenizedContent = outerTokenizer([quote])
            const deepTokenizedContent = innerTokenizer(tokenizedContent)
            expect(deepTokenizedContent[0].depth).toEqual(expectedDepth)
        })
        it.each([
            "> quote **one** with *two*",
            "  > quote `four` with ~~five~~",
            "> quote [link-title](link-url) with *two*",
        ])("should deep tokenize quote with zero depth", (line) => {
            const tokenizedContent = outerTokenizer([line])
            const deepTokenizedContent = innerTokenizer(tokenizedContent)
            expect(deepTokenizedContent).toMatchSnapshot()
        })
        it.each([
            "> > quote **one** with *two*",
            "  > > > quote `four` with ~~five~~",
            "> > > > quote [link-title](link-url) with *two*",
        ])("should deep tokenize quote with multiple depth", (line) => {
            const tokenizedContent = outerTokenizer([line])
            const deepTokenizedContent = innerTokenizer(tokenizedContent)
            expect(deepTokenizedContent).toMatchSnapshot()
        })
    })

    describe("paragraph", () => {
        it("should be deep tokenized", () => {
          const lines = [
            "a paragraph of words `first code` normal text here `code body` *first italics* here me crying *italic body* here me crying **first bolds** some normal again **bold body** [Kiran Parajuli](https://kiranparajuli.com.np) ~~strikes body~~ here some"
          ]
          const tokenizedContent = outerTokenizer(lines)
          const deepTokenizedContent = innerTokenizer(tokenizedContent)
          expect(deepTokenizedContent).toMatchSnapshot()
        })
    })
})