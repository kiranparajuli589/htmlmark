<template>
	<div class="home">
		<h1>HtmlMark <code>v0.2.1</code></h1>
		<hr>
		<p>
			<strong>HtmlMark</strong> is a very lightweight markdown parser.
			It is written in JavaScript and is available as a npm package.
		</p>

		<h2>🔑 Why HtmlMark?</h2>
		<ol>
			<li>no use of external dependencies</li>
			<li>lexer: to produce markdown tokens</li>
			<li>parser: to produce the HTML code from the lexer</li>
			<li>code highlighting support</li>
			<li>support for front matter</li>
		</ol>

		<h2>📦 Installation</h2>
		<p>Install the package using npm:</p>
		<pre><code class="language-bash">npm i htmlmark</code></pre>
		<p>Or using yarn:</p>
		<pre><code class="language-bash">yarn add htmlmark</code></pre>
		<p>Or using pnpm:</p>
		<pre><code class="language-bash">pnpm i htmlmark</code></pre>

		<h2>📝 Usage</h2>
		<pre><code>import HtmlMark from 'htmlmark';

const opts = {
	indent: 4,
	highlightFn: (code, lang) => {
		// return the highlighted code
	},
	useLinkRefs: true
};

const htmlmark = new HtmlMark(opts);

htmlmark.tokenize("## Hello World"); // returns the tokens
htmlmark.parse("## Hello World"); // returns the HTML code</code></pre>

		<h2>🎡 Options</h2>

		<table>
			<thead>
				<tr>
					<th>Option</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>indent</td>
					<td><code>number</code></td>
					<td><code>4</code></td>
					<td>Number of spaces (or tabs) to use for indentation</td>
				</tr>
				<tr>
					<td>tabSize</td>
					<td><code>number</code></td>
					<td><code>4</code></td>
					<td>Equivalent spaces for a single tab used</td>
				</tr>
				<tr>
					<td>highlightFn</td>
					<td><code>function</code></td>
					<td><code>undefined</code></td>
					<td>Function to highlight the code</td>
				</tr>
				<tr>
					<td>useLinkRefs</td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Whether to use link references or not</td>
				</tr>
			</tbody>
		</table>


		<h2>🎢 APIs</h2>

		<ol>
			<li><code>tokenize(markdown: string): Token[]</code>: Returns the lexer from the markdown string</li>
			<li><code>parse(markdown: string): string</code>: Returns the HTML code from the markdown string</li>
			<li><code>getFrontMatter(markdown: string): FrontMatter{}</code>: Returns the front matter from the markdown string</li>
		</ol>

		<h3>Lexer</h3>
		<p>The provided markdown string is scanned line by line and checked against various regex patterns to produce the accurate markdown tokens.</p>

		<p>A general token structure is as:</p>

		<pre><code>{
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
}</code></pre>

		<h3>Front Matter</h3>
		<p>The front matter is the metadata of the markdown file. It is written in the YAML format and is separated from the markdown content by a line containing three hyphens <code>---</code>. It must be placed at the top of the markdown file.</p>

		<h4>Example:</h4>

		<pre><code>---
title: Hello World
date: 2021-01-01
author: John Doe
---

## Hello World
Lorem ipsum dollar sit amet</code></pre>

		<p>The above markdown file will produce the following front matter:</p>

		<pre><code>{
	"title": "Hello World",
	"date": "2021-01-01",
	"author": "John Doe"
}</code></pre>

		<h2>💁 Contributing to HtmlMark</h2>
		<p>Contributions are always welcome, no matter how large or small. Before contributing, please read the <a href="https://github.com/kiranparajuli589/htmlmark/blob/main/CODE_OF_CONDUCT.md" title="code of conduct">code of conduct</a>. You can also find the development guide <a href="https://github.com/kiranparajuli589/htmlmark/blob/main/CONTRIBUTING.md" title="here">here</a>.</p>

		<h2>📜 License</h2>
		<p>GNU GENERAL PUBLIC LICENSE v3.0 © <a href="https://kiranparajuli.com.np" title="Kiran Parajuli">Kiran Parajuli</a></p>

	</div>
</template>
<style lang="scss" scoped>
.home {
	padding: 1rem;
	hr {
		margin-block: .5rem;
	}
	ol {
		margin-left: 1rem;
	}
	p, ol, pre, table {
		margin-bottom: 1rem;
	}
	h2, h3, h4, li {
		margin-bottom: .5rem;
	}
	pre {
		background-color: #eee;
		padding: 1rem;
		border-radius: 5px;
	}
	code {
		background-color: #eee;
		padding: .2rem .4rem;
		border-radius: 3px;
	}

	p {
		line-height: 1.5;
	}

	pre > code {
		background-color: transparent;
		padding: 0;
		border-radius: 0;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		border: 1px solid #ccc;
		td, th {
			border: 1px solid #ccc;
			padding: .5rem;
		}
		th {
			background-color: #eee;
			font-weight: 500;
			text-align: left;
		}
	}
}

body[dark] {
	.home {
		hr {
			border-color: #333;
		}
		ol {
			color: #eee;
		}
		pre {
			background-color: #333;
		}
		code {
			background-color: #333;
		}
		table {
			border-color: #333;
			td, th {
				border-color: #333;
			}
			th {
				background-color: #333;
			}
		}
	}
}
</style>
