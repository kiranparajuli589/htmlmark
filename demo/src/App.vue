<template>
	<div id="mdp">
		<nav>
			<img class="logo" :src="logo" alt="Logo">
			<div id="brand">MD Parser</div>
			<a href="https://github.com/kiranparajuli589/md-parser"
				 target="_blank" title="GitHub Repository" class="give-a-star"
			>
				Give a 🌟
			</a>
		</nav>
		<main>

			<p>&nbsp;&nbsp;&nbsp;&nbsp;A very lightweight markdown parser.</p>
			<br>

			<div id="converter">
				<div class="markdown">
					<div class="head">
						<h2 class="section-title">Markdown Input:</h2>
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
						<h2 class="section-title">Output:</h2>

						<select v-model="choice" id="output-choice"
							title="Choose Output Format"
						>
							<option value="preview">Preview</option>
							<option value="lex">Lexer Data</option>
							<option value="htmlSource">HTML Source</option>
						</select>

						<div class="time-taken">⏲️ Elapsed: {{timeTaken}}ms</div>
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
		<footer>
			Made with <span class="heart">&hearts;</span> by <a href="https://github.com/kiranparajuli589">@kiranparajuli589</a>
		</footer>
	</div>
</template>
<script setup>
import {ref} from "vue"
import { MDP } from "@kiran/md-parser"

const output = ref("")
const timeTaken = ref(0)
const lexerData = ref({})
const choice = ref("preview")

const logo = new URL("./assets/logo.png", import.meta.url).href

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
