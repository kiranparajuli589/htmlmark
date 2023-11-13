<template>
	<nav>
		<div class="nav-brand">
			<img class="logo" :src="logo" alt="Logo">
			<h2>
				<router-link to="/">HtmlMark</router-link>
			</h2>
		</div>
		<div class="nav-actions">
			<router-link class="nav-link" to="/">Home</router-link>
			<router-link class="nav-link" to="/demo">Demo</router-link>
			<router-link class="nav-link" to="/about">About</router-link>
			<a href="https://github.com/kiranparajuli589/htmlmark"
				 target="_blank" title="GitHub Repository" class="nav-link"
			>
				Give a 🌟
			</a>
			<button class="theme" @click="toggleTheme"
				title="Toggle Theme"
			>
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
