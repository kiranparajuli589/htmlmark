import { defineStore } from "pinia"

export const useThemeStore = defineStore({
	id: "theme",
	state: () => ({
		dark: true
	}),
	getters: {
		isDark: (state) => state.dark
	},
	actions: {
		toggle() {
			this.dark = !this.dark
		},
		setV(mode) {
			this.dark = mode
		}
	}
})
