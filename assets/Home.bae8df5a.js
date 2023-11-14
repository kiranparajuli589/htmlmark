import{_ as t,o as a,c as d,a as e}from"./index.0e48f500.js";const o={},n={class:"home"},r=e(`<h1 data-v-7f133b6d>HtmlMark <code data-v-7f133b6d>v0.2.2</code></h1><hr data-v-7f133b6d><p data-v-7f133b6d><strong data-v-7f133b6d>HtmlMark</strong> is a very lightweight markdown parser. It is written in JavaScript and is available as a npm package. </p><h2 data-v-7f133b6d>\u{1F511} Why HtmlMark?</h2><ol data-v-7f133b6d><li data-v-7f133b6d>no use of external dependencies</li><li data-v-7f133b6d>lexer: to produce markdown tokens</li><li data-v-7f133b6d>parser: to produce the HTML code from the lexer</li><li data-v-7f133b6d>code highlighting support</li><li data-v-7f133b6d>support for front matter</li></ol><h2 data-v-7f133b6d>\u{1F4E6} Installation</h2><p data-v-7f133b6d>Install the package using npm:</p><pre data-v-7f133b6d><code class="language-bash" data-v-7f133b6d>npm i htmlmark</code></pre><p data-v-7f133b6d>Or using yarn:</p><pre data-v-7f133b6d><code class="language-bash" data-v-7f133b6d>yarn add htmlmark</code></pre><p data-v-7f133b6d>Or using pnpm:</p><pre data-v-7f133b6d><code class="language-bash" data-v-7f133b6d>pnpm i htmlmark</code></pre><h2 data-v-7f133b6d>\u{1F4DD} Usage</h2><pre data-v-7f133b6d><code data-v-7f133b6d>import HtmlMark from &#39;htmlmark&#39;;

const opts = {
	indent: 4,
	highlightFn: (code, lang) =&gt; {
		// return the highlighted code
	},
	useLinkRefs: true
};

const htmlmark = new HtmlMark(opts);

htmlmark.tokenize(&quot;## Hello World&quot;); // returns the tokens
htmlmark.parse(&quot;## Hello World&quot;); // returns the HTML code</code></pre><h2 data-v-7f133b6d>\u{1F3A1} Options</h2><table data-v-7f133b6d><thead data-v-7f133b6d><tr data-v-7f133b6d><th data-v-7f133b6d>Option</th><th data-v-7f133b6d>Type</th><th data-v-7f133b6d>Default</th><th data-v-7f133b6d>Description</th></tr></thead><tbody data-v-7f133b6d><tr data-v-7f133b6d><td data-v-7f133b6d>indent</td><td data-v-7f133b6d><code data-v-7f133b6d>number</code></td><td data-v-7f133b6d><code data-v-7f133b6d>4</code></td><td data-v-7f133b6d>Number of spaces (or tabs) to use for indentation</td></tr><tr data-v-7f133b6d><td data-v-7f133b6d>tabSize</td><td data-v-7f133b6d><code data-v-7f133b6d>number</code></td><td data-v-7f133b6d><code data-v-7f133b6d>4</code></td><td data-v-7f133b6d>Equivalent spaces for a single tab used</td></tr><tr data-v-7f133b6d><td data-v-7f133b6d>highlightFn</td><td data-v-7f133b6d><code data-v-7f133b6d>function</code></td><td data-v-7f133b6d><code data-v-7f133b6d>undefined</code></td><td data-v-7f133b6d>Function to highlight the code</td></tr><tr data-v-7f133b6d><td data-v-7f133b6d>useLinkRefs</td><td data-v-7f133b6d><code data-v-7f133b6d>boolean</code></td><td data-v-7f133b6d><code data-v-7f133b6d>true</code></td><td data-v-7f133b6d>Whether to use link references or not</td></tr></tbody></table><h2 data-v-7f133b6d>\u{1F3A2} APIs</h2><ol data-v-7f133b6d><li data-v-7f133b6d><code data-v-7f133b6d>tokenize(markdown: string): Token[]</code>: Returns the lexer from the markdown string</li><li data-v-7f133b6d><code data-v-7f133b6d>parse(markdown: string): string</code>: Returns the HTML code from the markdown string</li><li data-v-7f133b6d><code data-v-7f133b6d>getFrontMatter(markdown: string): FrontMatter{}</code>: Returns the front matter from the markdown string</li></ol><h3 data-v-7f133b6d>Lexer</h3><p data-v-7f133b6d>The provided markdown string is scanned line by line and checked against various regex patterns to produce the accurate markdown tokens.</p><p data-v-7f133b6d>A general token structure is as:</p><pre data-v-7f133b6d><code data-v-7f133b6d>{
	&quot;indent&quot;: 0,
	&quot;level&quot;: 1,
	&quot;raw&quot;: &quot;# Heading One Text&quot;,
	&quot;setext&quot;: false,
	&quot;type&quot;: &quot;heading&quot;,
	&quot;value&quot;: &quot;Heading One Text&quot;,
	&quot;tokens&quot;: [{
		&quot;raw&quot;: &quot;Heading One Text&quot;,
		&quot;type&quot;: &quot;text&quot;,
		&quot;value&quot;: &quot;Heading One Text&quot;
	}]
}</code></pre><h3 data-v-7f133b6d>Front Matter</h3><p data-v-7f133b6d>The front matter is the metadata of the markdown file. It is written in the YAML format and is separated from the markdown content by a line containing three hyphens <code data-v-7f133b6d>---</code>. It must be placed at the top of the markdown file.</p><h4 data-v-7f133b6d>Example:</h4><pre data-v-7f133b6d><code data-v-7f133b6d>---
title: Hello World
date: 2021-01-01
author: John Doe
---

## Hello World
Lorem ipsum dollar sit amet</code></pre><p data-v-7f133b6d>The above markdown file will produce the following front matter:</p><pre data-v-7f133b6d><code data-v-7f133b6d>{
	&quot;title&quot;: &quot;Hello World&quot;,
	&quot;date&quot;: &quot;2021-01-01&quot;,
	&quot;author&quot;: &quot;John Doe&quot;
}</code></pre><h2 data-v-7f133b6d>\u{1F481} Contributing to HtmlMark</h2><p data-v-7f133b6d>Contributions are always welcome, no matter how large or small. Before contributing, please read the <a href="https://github.com/kiranparajuli589/htmlmark/blob/main/CODE_OF_CONDUCT.md" title="code of conduct" data-v-7f133b6d>code of conduct</a>. You can also find the development guide <a href="https://github.com/kiranparajuli589/htmlmark/blob/main/CONTRIBUTING.md" title="here" data-v-7f133b6d>here</a>.</p><h2 data-v-7f133b6d>\u{1F4DC} License</h2><p data-v-7f133b6d>GNU GENERAL PUBLIC LICENSE v3.0 \xA9 <a href="https://kiranparajuli.com.np" title="Kiran Parajuli" data-v-7f133b6d>Kiran Parajuli</a></p>`,32),i=[r];function f(l,b){return a(),d("div",n,i)}const s=t(o,[["render",f],["__scopeId","data-v-7f133b6d"]]);export{s as default};
