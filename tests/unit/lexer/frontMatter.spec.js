import {MarkdownParser} from "../../../lib/index.js";

const mdWithFrontMatter = `---
title: Hello World
---

# Hello World
`;

const mdWithoutFrontMatter = `# Hello World`

const mdWithArrayNumberAndObjectInFrontMatter = `---
title: Hello World
array: [1, 2, 3]
object: {a: 1, b: 2}
---

# Hello World
`
const mdp = new MarkdownParser({frontMatter: true})

describe('FrontMatter', function () {
	it('should parse front matter', function () {
		const parsed = mdp.parse(mdWithFrontMatter)
		expect(parsed).toMatchSnapshot()
	})
	it('should tokenize front matter', function () {
		const parsed = mdp.tokenize(mdWithFrontMatter)
		expect(parsed).toMatchSnapshot()
	})
	it('should tokenize front matter with array, number and object', function () {
		const parsed = mdp.tokenize(mdWithArrayNumberAndObjectInFrontMatter)
		expect(parsed).toMatchSnapshot()
	})
});
