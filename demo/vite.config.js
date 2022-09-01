import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig({
	base: (process.env.DEV === "true") ? "" : "/md-parser/",
	build: {
		outDir: "../docs",
	},
	plugins: [vue()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url))
		},
		extensions: [".js", ".vue", ".json"],
	}
})
