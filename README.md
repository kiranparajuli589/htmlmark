<div style="display: flex; justify-content: center; flex-direction: column; text-align: center">
	<h1>HtmlMark</h1>
	<p><img src="https://github.com/kiranparajuli589/htmlmark/blob/main/demo/src/assets/logo.png?raw=true" style="height: auto; width: 200px;" alt="HtmlMark Logo"></p>
	<p>A very lightweight Markdown Parser powered by Regex</p>
</div>


## 🔑 Why HtmlMark?
- no use of external dependencies
- lexer: to produce markdown tokens
- parser: to produce the HTML code from the lexer
- code highlighting support
- support for front matter

## 🌐 Demo

Checkout the features of the parser from this [Live Demo](https://kiranparajuli589.github.io/htmlmark/ 'Live Demo').

## 🎠 Installation

```bash
npm i htmlmark
```

## 💠 Usage

```js
import HtmlMark from 'htmlmark';

const opts = {
	indent: 4,
	highlightFn: (code, lang) => {
		// return the highlighted code
	},
	useLinkRefs: true
};

const htmlmark = new HtmlMark(opts);

htmlmark.tokenize("## Hello World"); // returns the tokens
htmlmark.parse("## Hello World"); // returns the HTML code
```

## 🎡 Options

| Option      | Type       | Default     | Description                                       |
|-------------|------------|-------------|---------------------------------------------------|
| indent      | `number`   | `4`         | Number of spaces (or tabs) to use for indentation |
| highlightFn | `function` | `undefined` | Function to highlight the code                    |
| useLinkRefs | `boolean`  | `true`      | Whether to use link references or not             |


## 🎢 APIs
- `tokenize(markdown: string): Token[]`:
  Returns the lexer from the markdown string
- `parse(markdown: string): string`:
  Returns the HTML code from the markdown string
- `getFrontMatter(markdown: string): FrontMatter{}`:
  Returns the front matter from the markdown string

### Lexer
The provided markdown string is scanned line by line and checked against various regex patterns to produce the accurate markdown tokens. A general token structure is as:

```json
{
	"indent": 0,
	"level": 1,
	"raw": "# Heading One Text",
	"setext": false,
	"type": "heading",
	"value": "Heading One Text",
	"tokens": [{
		"raw": "Heading One Text",
		"type": "text",
		"value": "Heading One Text"
	}]
}
```

### Front Matter
The front matter is the metadata of the markdown file. It is written in the YAML format and is separated from the markdown content by a line containing three hyphens `---`. It must be placed at the top of the markdown file.

#### Example:

```md
---
title: Hello World
date: 2021-01-01
author: John Doe
---

## Hello World
Lorem ipsum dollar sit amet
```

The above markdown file will produce the following front matter:

```json
{
	"title": "Hello World",
	"date": "2021-01-01",
	"author": "John Doe"
}
```

## 💁 Contributing to HtmlMark
Contributions are always welcome, no matter how large or small. Before contributing, please read the [code of conduct](https://github.com/kiranparajuli589/htmlmark/blob/main/CODE_OF_CONDUCT.md 'code of conduct'). You can also find the development guide [here](https://github.com/kiranparajuli589/htmlmark/blob/main/CONTRIBUTING.md 'here').

## 📝 License
GNU GENERAL PUBLIC LICENSE v3.0 © [Kiran Parajuli](https://kiranparajuli.com.np 'Kiran Parajuli')
