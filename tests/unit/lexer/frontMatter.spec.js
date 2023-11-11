import HtmlMark from "../../../lib/index.js"


const mdWithFrontMatter = `---
title: Hello World
---

# Hello World
`

const mdWithArrayNumberAndObjectInFrontMatter = `---
title: Hello World
array: [1, 2, 3]
object: {"a": 1, "b": 2}
stringArray: ["a", "b", "c"]
---

# Hello World
`

const moreRealFixture = `---
title: Steps to dockerize your django vue application
date: 2023-10-12 12:00:00
tags: ["django", "vue", "docker", "docker-compose", "gunicorn", "vite"]
---

# Steps to dockerize your django vue application
This is a step-wise guide to dockerize your django + vue application.`

const mdp = new HtmlMark()

describe("FrontMatter", function () {
	it("should get front matter from input", function () {
		const frontMatter = mdp.getFrontMatter(mdWithFrontMatter)
		expect(frontMatter).toMatchSnapshot()
	})
	it("should tokenize front matter with array, number and object", function () {
		const frontMatter = mdp.getFrontMatter(mdWithArrayNumberAndObjectInFrontMatter)
		expect(frontMatter).toMatchSnapshot()
	})
	it("should tokenize more real fixture", function () {
		const frontMatter = mdp.getFrontMatter(moreRealFixture)
		expect(frontMatter).toMatchSnapshot()
	})
	it("should skip the frontmatter while tokenizing", function () {
		const tokens = mdp.tokenize(mdWithFrontMatter)
		expect(tokens).toMatchSnapshot()
	})
	it("should skip the frontmatter while parsing", function () {
		const ast = mdp.parse(mdWithFrontMatter)
		expect(ast).toMatchSnapshot()
	})
})
