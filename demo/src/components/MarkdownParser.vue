<template>
	<main>
		<p class="subtitle">A very lightweight markdown parser.</p>
		<br>
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
						{{ lexerData }}
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
import { MDP } from "../../../lib"

const output = ref("")
const timeTaken = ref(0)
const lexerData = ref({})
const choice = ref("preview")


const handleChange = (e) => {
	// debounce for 100 ms
	setTimeout(() => {
		const {elapsedTime, lex, html} = MDP.hP(e.target.value)
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
