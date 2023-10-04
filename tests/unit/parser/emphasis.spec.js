import { MDP } from "../../../lib/mdp.js"

const mdp = new MDP()


describe("Emphasis Parsing", () => {
	describe("bold", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"**first bold** **second bold** **third bold**"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should be deep tokenized", () => {
			const lines = [
				"**bold with `code` and *italics* and ~~strikes~~ and [link](https://kiranparajuli.com.np)**"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("italics", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"*first italics* *second italics* *third italics*"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should be deep tokenized", () => {
			const lines = [
				"*italics with `code` and ~~strikes~~ and [link](https://kiranparajuli.com.np)*"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("strikes", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"~~first strikes~~ ~~second strikes~~ ~~third strikes~~"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should be deep tokenized", () => {
			const lines = [
				"~~strikes with ~ gem and `code` and **bold** and *italics* and [link](https://kiranparajuli.com.np)~~"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("code", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"`first code` `second code` `third code`"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should not be deep tokenized", () => {
			const lines = [
				"`code with ~ gem and **bold** and *italics* and [link](https://kiranparajuli.com.np)`"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should not panic with angles inside", () => {
			const lines = [
				"Pre-formatted code blocks are used for writing about programming or " +
				"markup source code. Rather than forming normal paragraphs, the lines " +
				"of a code block are interpreted literally. Markdown wraps a code block " +
				"in both `<pre>` and `<code>` tags."
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("link", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"[link](https://kiranparajuli.com.np) [link](https://kiranparajuli.com.np)"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should deep tokenized the link title", () => {
			const lines = [
				"[*italic* with **bold** and `code`](https://kiranparajuli.com.np)"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
})
