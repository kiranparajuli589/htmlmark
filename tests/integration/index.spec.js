const { pathJoin } = require("../../lib/util/file")
const { toHtml } = require("../../lib/index")


describe("To HTML", () => {
  it.each([
    // eslint-disable-next-line no-undef
    pathJoin(__dirname, "..", "fixtures/markdown.md"),
    // eslint-disable-next-line no-undef
    pathJoin(__dirname, "..", "fixtures/large_markdown.md")
  ])("should parse the markdown file content to html", (path) => {
    const html = toHtml(path)
    expect(html).toMatchSnapshot()
  })
})
