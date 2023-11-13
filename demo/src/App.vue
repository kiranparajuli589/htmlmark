<template>
	<div id="mdp">
		<TheAppBar />
		<router-view />
		<TheFooter />
	</div>
</template>
<script setup>
import TheAppBar from "./components/TheAppBar"
import TheFooter from "./components/TheFooter"
import { onMounted } from "vue"
import useTheme from "./composables/theme"

const { dark, setV } = useTheme()

onMounted(() => {
	setV(localStorage.getItem("dark") === "true")
	document.body.toggleAttribute("dark", dark.value)
})
</script>
<style lang="scss" scoped>
#mdp {
	.py-6 {
		padding-block: 1rem;
	}
}
</style>
