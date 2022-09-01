import { useThemeStore } from "../stores/theme"
import { storeToRefs } from "pinia"

export default function useTheme () {
	const store = useThemeStore()
	const { dark } = storeToRefs(store)
	const { toggle, setV } = store

	return {
		dark, toggle, setV
	}
}
