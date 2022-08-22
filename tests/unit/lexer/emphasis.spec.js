import { Lexer } from "../../../lib/lexer/index.js"


describe("emphasis", () => {
	describe("bold", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"**first bold** **second bold** **third bold**"
			]
			const lexer = new Lexer(lines)
			const lexerData = lexer.run()
			expect(lexerData).toMatchSnapshot()
		})
		it("should be deep tokenized", () => {
			const lines = [
				"**bold with `code` and *italics* and ~~strikes~~ and [link](https://kiranparajuli.com.np)**"
			]
			const lexer = new Lexer(lines)
			const lexerData = lexer.run()
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("italics", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"*first italics* *second italics* *third italics*"
			]
			const lexer = new Lexer(lines)
			const lexerData = lexer.run()
			expect(lexerData).toMatchSnapshot()
		})
		it("should be deep tokenized", () => {
			const lines = [
				"*italics with `code` and ~~strikes~~ and [link](https://kiranparajuli.com.np)*"
			]
			const lexer = new Lexer(lines)
			const lexerData = lexer.run()
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("strikes", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"~~first strikes~~ ~~second strikes~~ ~~third strikes~~"
			]
			const lexer = new Lexer(lines)
			const lexerData = lexer.run()
			expect(lexerData).toMatchSnapshot()
		})
		it("should be deep tokenized", () => {
			const lines = [
				"~~strikes with ~ gem and `code` and **bold** and *italics* and [link](https://kiranparajuli.com.np)~~"
			]
			const lexer = new Lexer(lines)
			const lexerData = lexer.run()
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("code", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"`first code` `second code` `third code`"
			]
			const lexer = new Lexer(lines)
			const lexerData = lexer.run()
			expect(lexerData).toMatchSnapshot()
		})
		it("should not be deep tokenized", () => {
			const lines = [
				"`code with ~ gem and **bold** and *italics* and [link](https://kiranparajuli.com.np)`"
			]
			const lexer = new Lexer(lines)
			const lexerData = lexer.run()
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("link", () => {
		it("should match the consecutive occurrences", () => {
			const lines = [
				"[link](https://kiranparajuli.com.np) [link](https://kiranparajuli.com.np)"
			]
			const lexer = new Lexer(lines)
			const lexerData = lexer.run()
			expect(lexerData).toMatchSnapshot()
		})
		it("should deep tokenized the link title", () => {
			const lines = [
				"[*italic* with **bold** and `code`](https://kiranparajuli.com.np)"
			]
			const lexer = new Lexer(lines)
			const lexerData = lexer.run()
			expect(lexerData).toMatchSnapshot()
		})
	})
})
