import { File } from "../../lib/util/file.js"
import {MarkdownParser} from "../../lib/index.js";

const mdp = new MarkdownParser()

describe("Small MD To HTML", () => {
	it.each([
		// eslint-disable-next-line no-undef
		File.pathJoin(__dirname, "..", "fixtures/markdown.md")
	])("should parse the small markdown file content to html", (path) => {
		const html = mdp.parseFile(path)
		expect(html).toMatchSnapshot()
	})
})
