const path = require("path")
const { read } = require("../../../lib/file")
const tokenize = require("../../../lib/tokenizer/index")

describe("tokenization", () => {
  it("should tokenize a markdown content", () => {
    // eslint-disable-next-line no-undef
    const fileContent = read(path.join(__dirname, "markdown.md")).split("\n")
    // stringified because of \r in raw content of lines
    // see https://github.com/kiranparajuli589/markdown-parser/runs/7184851840?check_suite_focus=true
    expect(JSON.stringify(tokenize(fileContent), undefined, 2)).toMatchSnapshot()
  })

})