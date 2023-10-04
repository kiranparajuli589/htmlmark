import {MarkdownParser} from "../index.js";
import {File} from "../util/file.js";

const args = process.argv.slice(2);

const md = args[0];

const mdp = new MarkdownParser()

let parsed
if (File.exists(md)) {
	parsed = mdp.parseFile(md)
} else {
	parsed = mdp.parse(md)
}

console.log(parsed)
