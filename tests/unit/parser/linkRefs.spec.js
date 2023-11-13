import HtmlMark from "../../../lib/index.js"


describe("Link Reference", () => {
	const htmlMarkWithLinkRefsOn = new HtmlMark()
	const htmlMarkWithLinkRefsOff = new HtmlMark({ useLinkRefs: false })

	const lines = `[I'm an inline-style link](https://www.somewebsite.com)

[I'm an inline-style link with title](https://www.somewebsite.com "somewebsite's Homepage")

[I'm a reference-style link][Arbitrary case-insensitive reference text]

[I'm a relative reference to a repository file](../blob/master/LICENSE)

[You can use numbers for reference-style link definitions][1]

Or leave it empty and use the [link text itself]

Some text to show that the reference links can follow later.

[arbitrary case-insensitive reference text]: https://www.somewebsite.org
[1]: http://somewebsite.org "somewebsite's Homepage"
[link text itself]: http://www.somewebsite.com`

	it("should use the link references for link construction", () => {
		const html = htmlMarkWithLinkRefsOn.parse(lines)
		expect(html).toMatchSnapshot()
	})

	it("should not use the link references for link construction when disabled from config", () => {
		const html = htmlMarkWithLinkRefsOff.parse(lines)
		expect(html).toMatchSnapshot()
	})
})
