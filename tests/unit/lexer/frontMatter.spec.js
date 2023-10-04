import { MarkdownParser } from "../../../lib/index.js"


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

const mdp = new MarkdownParser({ frontMatter: true })

describe("FrontMatter", function () {
	it("should parse front matter", function () {
		const parsed = mdp.parse(mdWithFrontMatter)
		expect(parsed).toMatchSnapshot()
	})
	it("should tokenize front matter", function () {
		const parsed = mdp.tokenize(mdWithFrontMatter)
		expect(parsed).toMatchSnapshot()
	})
	it("should tokenize front matter with array, number and object", function () {
		const parsed = mdp.tokenize(mdWithArrayNumberAndObjectInFrontMatter)
		expect(parsed).toMatchSnapshot()
	})
	it("should tokenize more real fixture", function () {
		const parsed = mdp.getFrontMatter(moreRealFixture)
		expect(parsed).toMatchSnapshot()
	})
})
