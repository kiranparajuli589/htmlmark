<template>
	<div id="mdp">
		<nav>
			<div id="brand">MD Parser</div>
			<a href="http://github.com/kiranparajuli589/md-parser"
				 target="_blank" title="GitHub Repository" class="give-a-star"
			>
				Give a 🌟
			</a>
		</nav>
		<main>
			<p>Content Section</p>
			<br>

			<div id="converter">
				<div class="markdown">
					<textarea name="markdown-input" id="md-input" @input="handleChange" />
				</div>
				<div class="o-html">
					<div class="preview" v-html="htmlContent" />
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

const htmlContent = ref("")

const handleChange = (e) => {

	// debounce for 1 second
	setTimeout(() => {
		htmlContent.value = MDP.h(e.target.value.split("\n"))
	}, 100)
}
</script>
