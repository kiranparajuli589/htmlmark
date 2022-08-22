import { commonTokensList } from "../../fixtures/commTokens.js"
import { MDP } from "../../../lib/index.js"


describe("Parser Commons", () => {
	describe("newline", () => {
		it.each([
			{ lines: [""] },
			{ lines: ["\n"] },
			{ lines: ["", "\n"] }
		])("should not include the top empty lines", ({ lines }) => {
			const html = MDP.h(lines)
			expect(html).toMatchSnapshot()
		})
		it.each(["", "\n"])("should include the empty line after some content", (eLine) => {
			const lines = [
				"some plain text",
				eLine
			]
			const html = MDP.h(lines)
			expect(html).toMatchSnapshot()
		})
		it("should combine multiple consequent new lines to a single one", () => {
			const lines = [
				"some plain text",
				"\n",
				"",
				"some more plain text"
			]
			const html = MDP.h(lines)
			expect(html).toMatchSnapshot()
		})
	})
	describe("comment", () => {
		it("should add a comment", () => {
			const lines = [
				"one",
				"<!-- comment -->",
				"three"
			]
			const html = MDP.h(lines)
			expect(html).toMatchSnapshot()
		})
	})
	describe("common tokens", () => {
		it.each(commonTokensList)("should parse the common tokens", (line) => {
			const lines = [line]
			const html = MDP.h(lines)
			expect(html).toMatchSnapshot()
		})
		it.each(commonTokensList)("should parse the common tokens with some space before", (line) => {
			const indent = "  "
			const lines = [indent + line]
			const html = MDP.h(lines)
			expect(html).toMatchSnapshot()
		})
		it("should parse underlined heading", () => {
			const lines = [
				"Heading 1",
				"======",
				"Heading 2",
				"------",
				"Normal text"
			]
			const html = MDP.h(lines)
			expect(html).toMatchSnapshot()
		})
	})
	describe("hr line", () => {
		it.each([
			"---",
			"--",
			"-----"
		])("should parse the hr line", (line) => {
			const lines = [
				line
			]
			const html = MDP.h(lines)
			expect(html).toMatchSnapshot()
		})
		it("should not allow multiple consecutive hr lines", () => {
			const lines = [
				"---",
				"---"
			]
			const html = MDP.h(lines)
			expect(html).toMatchSnapshot()
		})
	})
})
