<template>
	<nav>
		<img class="logo" :src="logo" alt="Logo">
		<div id="brand">MD Parser</div>
		<div class="nav-actions">
			<a href="https://github.com/kiranparajuli589/md-parser"
				 target="_blank" title="GitHub Repository" class="give-a-star"
			>
				Give a 🌟
			</a>
			<button class="theme" @click="toggleTheme">
				<span v-if="dark">🌞</span>
				<span v-else>🌙</span>
			</button>
		</div>
	</nav>
</template>
<script setup>
import useTheme from "../composables/theme"

const { dark, toggle } = useTheme()

const logo = new URL("../assets/logo.png", import.meta.url).href

const toggleTheme = () => {
	toggle()
	localStorage.setItem("dark", dark.value.toString())
	document.body.toggleAttribute("dark", dark.value)
}
</script>
