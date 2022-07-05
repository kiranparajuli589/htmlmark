const path = require("path")
const { read } = require("../../../lib/file")
const tokenize = require("../../../lib/tokenizer/index")

describe("tokenization", () => {
  it("should tokenize a markdown content", () => {
    // eslint-disable-next-line no-undef
    const fileContent = read(path.join(__dirname, "..", "..", "fixtures", "markdown.md")).split("\n")
    expect(tokenize(fileContent)).toMatchSnapshot()
  })

})