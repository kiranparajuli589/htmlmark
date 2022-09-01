import { File } from "../util/file.js"
import { MDP } from "../index.js"


export class CLI {
	/**
	 * Runs HTML parsing for a file
	 * a wrapper for the lexer and parser
	 *
	 * @param {string} filePath - Path to a markdown file
	 * @returns {string} - A HTML string
	 */
	static hF(filePath) {
		const fileContent = File.read(filePath)
		const lineArray = fileContent.split("\n")
		return MDP.hT(lineArray)
	}
}
