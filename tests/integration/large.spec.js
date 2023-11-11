import File from "../../lib/util/file.js"
import HtmlMark from "../../lib/index.js"


const mdp = new HtmlMark({
	frontMatter: true
})


describe("Large MD To HTML", () => {
	it.each([
		// eslint-disable-next-line no-undef
		File.pathJoin(__dirname, "..", "fixtures/large_markdown.md")
	])("should parse the large markdown file content to html", (path) => {
		const html = mdp.parse(File.read(path))
		expect(html).toMatchSnapshot()
	})
})
