import MDP from "../../lib/index.js"
import { File } from "../../lib/util/file.js"


describe("To HTML", () => {
  it.each([
    // eslint-disable-next-line no-undef
    File.pathJoin(__dirname, "..", "fixtures/markdown.md"),
    // eslint-disable-next-line no-undef
    // File.pathJoin(__dirname, "..", "fixtures/large_markdown.md")
  ])("should parse the markdown file content to html", (path) => {
    const html = MDP.h(path)
    expect(html).toMatchSnapshot()
  })
})
