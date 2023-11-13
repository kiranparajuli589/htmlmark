import { Indent } from "../../../lib/util/index.js"


describe("Indent", () => {
	const indentObj4x4 = new Indent(4, 4)
	describe("function 'raw'", () => {
		it.each([
			"",
			"\n",
			undefined,
			"No indentation here"
		])("zero indentation for line: `%s`", (line) => {
			expect(indentObj4x4.raw(line)).toBe(0)
		})
		it("should return the indentation count", () => {
			const line = "   This is a line."
			expect(indentObj4x4.raw(line)).toBe(3)
		})
		it("should return the indentation count for tab", () => {
			const line = "\t\tThis is a line."
			expect(indentObj4x4.raw(line)).toBe(8)
		})
		it("should return the indentation count for mixed tab and space", () => {
			const line = "\t    This is a line."
			expect(indentObj4x4.raw(line)).toBe(8)
		})
	})
	describe("function 'calc'", () => {
		it.each([
			{ str: "  This is a line.", indent: 0 },
			{ str: "    This is a line.", indent: 4 },
			{ str: "      This is a line.", indent: 4 },
			{ str: "        This is a line.", indent: 8 },
			{ str: "\tThis is a line.", indent: 4 },
			{ str: "\t\t\t\tThis is a line.", indent: 16 }
		])("should return the calculated indentation", ({ str, indent }) => {
			expect(indentObj4x4.calc(str)).toBe(indent)
		})
	})
})
