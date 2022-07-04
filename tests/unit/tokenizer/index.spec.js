const path = require("path")
const { read } = require("../../../lib/file")
const tokenize = require("../../../lib/tokenizer/index")
describe("tokenization", () => {
    it("should tokenize a markdown content", () => {
        fileContent = read(path.join(__dirname, "markdown.md"))
        fileContent = fileContent.split("\n")
        const tokens = tokenize(fileContent)
        expect(tokens).toMatchSnapshot()
    })

})