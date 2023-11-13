import{_ as e,o as t,c as a,a as d}from"./index.30caca4f.js";const o={},n={class:"home"},c=d(`<h1 data-v-d6c7fe8e>HtmlMark <code data-v-d6c7fe8e>v0.2.1</code></h1><hr data-v-d6c7fe8e><p data-v-d6c7fe8e><strong data-v-d6c7fe8e>HtmlMark</strong> is a very lightweight markdown parser. It is written in JavaScript and is available as a npm package. </p><h2 data-v-d6c7fe8e>\u{1F511} Why HtmlMark?</h2><ol data-v-d6c7fe8e><li data-v-d6c7fe8e>no use of external dependencies</li><li data-v-d6c7fe8e>lexer: to produce markdown tokens</li><li data-v-d6c7fe8e>parser: to produce the HTML code from the lexer</li><li data-v-d6c7fe8e>code highlighting support</li><li data-v-d6c7fe8e>support for front matter</li></ol><h2 data-v-d6c7fe8e>\u{1F4E6} Installation</h2><p data-v-d6c7fe8e>Install the package using npm:</p><pre data-v-d6c7fe8e><code class="language-bash" data-v-d6c7fe8e>npm i htmlmark</code></pre><p data-v-d6c7fe8e>Or using yarn:</p><pre data-v-d6c7fe8e><code class="language-bash" data-v-d6c7fe8e>yarn add htmlmark</code></pre><p data-v-d6c7fe8e>Or using pnpm:</p><pre data-v-d6c7fe8e><code class="language-bash" data-v-d6c7fe8e>pnpm i htmlmark</code></pre><h2 data-v-d6c7fe8e>\u{1F4DD} Usage</h2><pre data-v-d6c7fe8e><code data-v-d6c7fe8e>import HtmlMark from &#39;htmlmark&#39;;

const opts = {
	indent: 4,
	highlightFn: (code, lang) =&gt; {
		// return the highlighted code
	},
	useLinkRefs: true
};

const htmlmark = new HtmlMark(opts);

htmlmark.tokenize(&quot;## Hello World&quot;); // returns the tokens
htmlmark.parse(&quot;## Hello World&quot;); // returns the HTML code</code></pre><h2 data-v-d6c7fe8e>\u{1F3A1} Options</h2><table data-v-d6c7fe8e><thead data-v-d6c7fe8e><tr data-v-d6c7fe8e><th data-v-d6c7fe8e>Option</th><th data-v-d6c7fe8e>Type</th><th data-v-d6c7fe8e>Default</th><th data-v-d6c7fe8e>Description</th></tr></thead><tbody data-v-d6c7fe8e><tr data-v-d6c7fe8e><td data-v-d6c7fe8e>indent</td><td data-v-d6c7fe8e><code data-v-d6c7fe8e>number</code></td><td data-v-d6c7fe8e><code data-v-d6c7fe8e>4</code></td><td data-v-d6c7fe8e>Number of spaces (or tabs) to use for indentation</td></tr><tr data-v-d6c7fe8e><td data-v-d6c7fe8e>tabSize</td><td data-v-d6c7fe8e><code data-v-d6c7fe8e>number</code></td><td data-v-d6c7fe8e><code data-v-d6c7fe8e>4</code></td><td data-v-d6c7fe8e>Equivalent spaces for a single tab used</td></tr><tr data-v-d6c7fe8e><td data-v-d6c7fe8e>highlightFn</td><td data-v-d6c7fe8e><code data-v-d6c7fe8e>function</code></td><td data-v-d6c7fe8e><code data-v-d6c7fe8e>undefined</code></td><td data-v-d6c7fe8e>Function to highlight the code</td></tr><tr data-v-d6c7fe8e><td data-v-d6c7fe8e>useLinkRefs</td><td data-v-d6c7fe8e><code data-v-d6c7fe8e>boolean</code></td><td data-v-d6c7fe8e><code data-v-d6c7fe8e>true</code></td><td data-v-d6c7fe8e>Whether to use link references or not</td></tr></tbody></table><h2 data-v-d6c7fe8e>\u{1F3A2} APIs</h2><ol data-v-d6c7fe8e><li data-v-d6c7fe8e><code data-v-d6c7fe8e>tokenize(markdown: string): Token[]</code>: Returns the lexer from the markdown string</li><li data-v-d6c7fe8e><code data-v-d6c7fe8e>parse(markdown: string): string</code>: Returns the HTML code from the markdown string</li><li data-v-d6c7fe8e><code data-v-d6c7fe8e>getFrontMatter(markdown: string): FrontMatter{}</code>: Returns the front matter from the markdown string</li></ol><h3 data-v-d6c7fe8e>Lexer</h3><p data-v-d6c7fe8e>The provided markdown string is scanned line by line and checked against various regex patterns to produce the accurate markdown tokens.</p><p data-v-d6c7fe8e>A general token structure is as:</p><pre data-v-d6c7fe8e><code data-v-d6c7fe8e>{
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
}</code></pre><h3 data-v-d6c7fe8e>Front Matter</h3><p data-v-d6c7fe8e>The front matter is the metadata of the markdown file. It is written in the YAML format and is separated from the markdown content by a line containing three hyphens <code data-v-d6c7fe8e>---</code>. It must be placed at the top of the markdown file.</p><h4 data-v-d6c7fe8e>Example:</h4><pre data-v-d6c7fe8e><code data-v-d6c7fe8e>---
title: Hello World
date: 2021-01-01
author: John Doe
---

## Hello World
Lorem ipsum dollar sit amet</code></pre><p data-v-d6c7fe8e>The above markdown file will produce the following front matter:</p><pre data-v-d6c7fe8e><code data-v-d6c7fe8e>{
	&quot;title&quot;: &quot;Hello World&quot;,
	&quot;date&quot;: &quot;2021-01-01&quot;,
	&quot;author&quot;: &quot;John Doe&quot;
}</code></pre><h2 data-v-d6c7fe8e>\u{1F481} Contributing to HtmlMark</h2><p data-v-d6c7fe8e>Contributions are always welcome, no matter how large or small. Before contributing, please read the <a href="https://github.com/kiranparajuli589/htmlmark/blob/main/CODE_OF_CONDUCT.md" title="code of conduct" data-v-d6c7fe8e>code of conduct</a>. You can also find the development guide <a href="https://github.com/kiranparajuli589/htmlmark/blob/main/CONTRIBUTING.md" title="here" data-v-d6c7fe8e>here</a>.</p><h2 data-v-d6c7fe8e>\u{1F4DC} License</h2><p data-v-d6c7fe8e>GNU GENERAL PUBLIC LICENSE v3.0 \xA9 <a href="https://kiranparajuli.com.np" title="Kiran Parajuli" data-v-d6c7fe8e>Kiran Parajuli</a></p>`,32),r=[c];function i(f,l){return t(),a("div",n,r)}const s=e(o,[["render",i],["__scopeId","data-v-d6c7fe8e"]]);export{s as default};
