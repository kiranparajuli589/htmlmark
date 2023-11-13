import{_ as e,o as t,c as a,a as o}from"./index.518b86a6.js";const d={},n={class:"home"},c=o(`<h1 data-v-659e2fce>HtmlMark <code data-v-659e2fce>v0.2.1</code></h1><hr data-v-659e2fce><p data-v-659e2fce><strong data-v-659e2fce>HtmlMark</strong> is a very lightweight markdown parser. It is written in JavaScript and is available as a npm package. </p><h2 data-v-659e2fce>\u{1F511} Why HtmlMark?</h2><ol data-v-659e2fce><li data-v-659e2fce>no use of external dependencies</li><li data-v-659e2fce>lexer: to produce markdown tokens</li><li data-v-659e2fce>parser: to produce the HTML code from the lexer</li><li data-v-659e2fce>code highlighting support</li><li data-v-659e2fce>support for front matter</li></ol><h2 data-v-659e2fce>\u{1F4E6} Installation</h2><p data-v-659e2fce>Install the package using npm:</p><pre data-v-659e2fce><code class="language-bash" data-v-659e2fce>npm i htmlmark</code></pre><p data-v-659e2fce>Or using yarn:</p><pre data-v-659e2fce><code class="language-bash" data-v-659e2fce>yarn add htmlmark</code></pre><p data-v-659e2fce>Or using pnpm:</p><pre data-v-659e2fce><code class="language-bash" data-v-659e2fce>pnpm i htmlmark</code></pre><h2 data-v-659e2fce>\u{1F4DD} Usage</h2><pre data-v-659e2fce><code data-v-659e2fce>import HtmlMark from &#39;htmlmark&#39;;

const opts = {
	indent: 4,
	highlightFn: (code, lang) =&gt; {
		// return the highlighted code
	},
	useLinkRefs: true
};

const htmlmark = new HtmlMark(opts);

htmlmark.tokenize(&quot;## Hello World&quot;); // returns the tokens
htmlmark.parse(&quot;## Hello World&quot;); // returns the HTML code</code></pre><h2 data-v-659e2fce>\u{1F3A1} Options</h2><table data-v-659e2fce><thead data-v-659e2fce><tr data-v-659e2fce><th data-v-659e2fce>Option</th><th data-v-659e2fce>Type</th><th data-v-659e2fce>Default</th><th data-v-659e2fce>Description</th></tr></thead><tbody data-v-659e2fce><tr data-v-659e2fce><td data-v-659e2fce>indent</td><td data-v-659e2fce><code data-v-659e2fce>number</code></td><td data-v-659e2fce><code data-v-659e2fce>4</code></td><td data-v-659e2fce>Number of spaces (or tabs) to use for indentation</td></tr><tr data-v-659e2fce><td data-v-659e2fce>tabSize</td><td data-v-659e2fce><code data-v-659e2fce>number</code></td><td data-v-659e2fce><code data-v-659e2fce>4</code></td><td data-v-659e2fce>Equivalent spaces for a single tab used</td></tr><tr data-v-659e2fce><td data-v-659e2fce>highlightFn</td><td data-v-659e2fce><code data-v-659e2fce>function</code></td><td data-v-659e2fce><code data-v-659e2fce>undefined</code></td><td data-v-659e2fce>Function to highlight the code</td></tr><tr data-v-659e2fce><td data-v-659e2fce>useLinkRefs</td><td data-v-659e2fce><code data-v-659e2fce>boolean</code></td><td data-v-659e2fce><code data-v-659e2fce>true</code></td><td data-v-659e2fce>Whether to use link references or not</td></tr></tbody></table><h2 data-v-659e2fce>\u{1F3A2} APIs</h2><ol data-v-659e2fce><li data-v-659e2fce><code data-v-659e2fce>tokenize(markdown: string): Token[]</code>: Returns the lexer from the markdown string</li><li data-v-659e2fce><code data-v-659e2fce>parse(markdown: string): string</code>: Returns the HTML code from the markdown string</li><li data-v-659e2fce><code data-v-659e2fce>getFrontMatter(markdown: string): FrontMatter{}</code>: Returns the front matter from the markdown string</li></ol><h3 data-v-659e2fce>Lexer</h3><p data-v-659e2fce>The provided markdown string is scanned line by line and checked against various regex patterns to produce the accurate markdown tokens.</p><p data-v-659e2fce>A general token structure is as:</p><pre data-v-659e2fce><code data-v-659e2fce>{
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
}</code></pre><h3 data-v-659e2fce>Front Matter</h3><p data-v-659e2fce>The front matter is the metadata of the markdown file. It is written in the YAML format and is separated from the markdown content by a line containing three hyphens <code data-v-659e2fce>---</code>. It must be placed at the top of the markdown file.</p><h4 data-v-659e2fce>Example:</h4><pre data-v-659e2fce><code data-v-659e2fce>---
title: Hello World
date: 2021-01-01
author: John Doe
---

## Hello World
Lorem ipsum dollar sit amet</code></pre><p data-v-659e2fce>The above markdown file will produce the following front matter:</p><pre data-v-659e2fce><code data-v-659e2fce>{
	&quot;title&quot;: &quot;Hello World&quot;,
	&quot;date&quot;: &quot;2021-01-01&quot;,
	&quot;author&quot;: &quot;John Doe&quot;
}</code></pre><h2 data-v-659e2fce>\u{1F481} Contributing to HtmlMark</h2><p data-v-659e2fce>Contributions are always welcome, no matter how large or small. Before contributing, please read the <a href="https://github.com/kiranparajuli589/htmlmark/blob/main/CODE_OF_CONDUCT.md" title="code of conduct" data-v-659e2fce>code of conduct</a>. You can also find the development guide <a href="https://github.com/kiranparajuli589/htmlmark/blob/main/CONTRIBUTING.md" title="here" data-v-659e2fce>here</a>.</p><h2 data-v-659e2fce>\u{1F4DC} License</h2><p data-v-659e2fce>GNU GENERAL PUBLIC LICENSE v3.0 \xA9 <a href="https://kiranparajuli.com.np" title="Kiran Parajuli" data-v-659e2fce>Kiran Parajuli</a></p>`,32),r=[c];function i(f,l){return t(),a("div",n,r)}const s=e(d,[["render",i],["__scopeId","data-v-659e2fce"]]);export{s as default};
