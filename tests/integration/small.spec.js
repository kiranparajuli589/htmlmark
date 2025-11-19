import File from "../../lib/util/file.js"
import HtmlMark from "../../lib/index.js"


const mdp = new HtmlMark()

describe("Small MD To HTML", () => {
	it.each([
		File.pathJoin(__dirname, "..", "fixtures/markdown.md")
	])("should parse the small markdown file content to html", (path) => {
		const html = mdp.parse(File.read(path))
		expect(html).toMatchSnapshot()
	})
})
