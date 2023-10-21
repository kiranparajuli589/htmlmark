<template>
	<main>
		<p class="subtitle">A very lightweight markdown parser.</p>
		<br>
		<div id="converter">
			<div class="markdown">
				<div class="head">
					<div class="section-title">Markdown Input:</div>
					<div class="options">
						<label for="code-highlighter">
							<input type="checkbox" id="code-highlighter" v-model="useCodeHighlighter" />
							Enable Code Highlighter
						</label>
					</div>
					<button class="clear" title="Clear Input"
									@click="clearInput"
					>
						❌
					</button>
				</div>
				<textarea name="markdown-input" id="md-input" @input="handleChange" />
			</div>
			<div class="o-html">
				<div class="head">
					<div class="section-title">Output:</div>

					<select v-model="choice" id="output-choice"
									title="Choose Output Format"
					>
						<option value="preview">Preview</option>
						<option value="lex">Lexer Data</option>
						<option value="htmlSource">HTML Source</option>
					</select>

					<div class="time-taken">
						⏲️&nbsp;Elapsed:&nbsp;<span>{{timeTaken}}</span>&nbsp;ms
					</div>
				</div>
				<div class="preview-pane" >
					<div v-if="choice === 'preview'" class="preview" v-html="output" />
					<div v-else-if="choice === 'lex'" class="preview">
						<pre><code>{{ JSON.stringify(lexerData, null, 2).trim() }}</code></pre>
					</div>
					<div v-else class="html-source">
						{{ output }}
					</div>
				</div>
			</div>
		</div>
	</main>
</template>
<script setup>
import { ref } from "vue"
import hljs from "highlight.js"
import { MDP } from "../mdp.js"

const useCodeHighlighter = ref(false)

const output = ref("")
const timeTaken = ref(0)
const lexerData = ref({})
const choice = ref("preview")

/**
 * Code highlighter
 * @param {string} code Code to highlight
 * @param {string} language Language of the code
 * @returns {string}
 */
const codeHighlighter = (code) => {
	return hljs.highlightAuto(code).value
}

const mdp = new MDP({
	indent: 2,
})
const mdpWithCodeHighlighter = new MDP({
	indent: 2,
	codeHighlighter,
})

const handleChange = (e) => {
	// debounce for 100 ms
	setTimeout(() => {
		const {elapsedTime, lex, html} = useCodeHighlighter.value
			? mdpWithCodeHighlighter.hP(e.target.value)
			: mdp.hP(e.target.value)
		timeTaken.value = elapsedTime
		lexerData.value = lex
		output.value = html
	}, 100)
}
const clearInput = () => {
	document.getElementById("md-input").value = ""
	output.value = ""
	timeTaken.value = 0
	lexerData.value = {}
	document.getElementById("md-input").focus()
}
</script>
