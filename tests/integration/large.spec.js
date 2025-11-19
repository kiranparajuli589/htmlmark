import File from "../../lib/util/file.js"
import HtmlMark from "../../lib/index.js"


const mdp = new HtmlMark({
	frontMatter: true
})


describe("Large MD To HTML", () => {
	it.each([
		File.pathJoin(__dirname, "..", "fixtures/large_markdown.md")
		// File.pathJoin(__dirname, "..", "fixtures/markdownit.md")
	])("should parse the large markdown file content to html", (path) => {
		const html = mdp.parse(File.read(path))
		expect(html).toMatchSnapshot()
	})
})
