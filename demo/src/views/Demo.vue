<template>
	<main>
		<p class="subtitle">A very lightweight markdown parser.</p>
		<br>
		<div class="options">
			<div class="title">Configuration Options</div>
			<label for="code-highlighter">
				<input type="checkbox"
							 id="code-highlighter"
							 v-model="useCodeHighlighter"
							 @change="prepareParser"
				/>
				Enable Code Highlighter
			</label>

			<label for="use-link-refs">
				<input type="checkbox"
							 id="use-link-refs"
							 v-model="useLinkRefs"
							 @change="prepareParser"
				/>
				Use Link References
			</label>

			<label for="indent-select">
				<select id="indent-select" v-model="indentSize"
								@change="prepareParser"
				>
					<option value="2">2</option>
					<option value="4">4</option>
					<option value="8">8</option>
				</select>
				Indent Size
			</label>
			<label for="tab-select">
				<select id="tab-select" v-model="tabSize"
								@change="prepareParser"
				>
					<option value="2">2</option>
					<option value="4">4</option>
					<option value="8">8</option>
				</select>
				Indent Size
			</label>
		</div>
		<div id="converter">
			<div class="markdown">
				<div class="head">
					<div class="section-title">Markdown Input:</div>
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
import {ref, onMounted} from "vue"
import hljs from "highlight.js"
import { MDP } from "../mdp.js"

const output = ref("")
const timeTaken = ref(0)
const lexerData = ref({})
const choice = ref("preview")
const indentSize = ref(4)
const tabSize = ref(4)
const useCodeHighlighter = ref(false)
const useLinkRefs = ref(true)
const mdp = ref(null)

/**
 * Code highlighter
 * @param {string} code Code to highlight
 * @param {string} lang Language of the code
 * @returns {string}
 */
const highlightFn = (code, lang) => {
	if (lang && hljs.getLanguage(lang)) {
		return hljs.highlight(code, { language: lang }).value
	} else {
		return hljs.highlightAuto(code).value
	}
}

const handleChange = (e) => {
	// debounce for 100 ms
	setTimeout(() => {
		const {elapsedTime, lex, html} = mdp.value.hP(e.target.value)
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

const prepareParser = () => {
	const opts = {
		indent: indentSize.value,
		highlightFn: useCodeHighlighter.value ? highlightFn : null,
		useLinkRefs: !!useLinkRefs.value,
		tabSize: tabSize.value,
	}
	console.log(opts)
	mdp.value = new MDP(opts)
	const inputValue = document.getElementById("md-input").value
	if (inputValue) {
		handleChange({target: {value: inputValue}})
	}
}

onMounted(() => {
	prepareParser()
})
</script>
