import js from "@eslint/js"
import importPlugin from "eslint-plugin-import"
import globals from "globals"

export default [
	{
		ignores: ["demo/", "docs/", "node_modules/", "scripts/", "dist/"]
	},
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.node,
				...globals.browser,
				...globals.es2021
			}
		},
		plugins: {
			import: importPlugin
		},
		rules: {
			"no-var": "error",
			indent: ["error", "tab"],
			"comma-dangle": "error",
			"no-multi-spaces": "error",
			semi: ["error", "never"],
			quotes: ["error", "double"],
			"linebreak-style": ["error", "unix"],
			"object-curly-spacing": ["error", "always"],
			"import/newline-after-import": ["error", { count: 2 }],
			"no-console": ["error", { allow: ["debug", "info", "error"] }],
			"no-constant-binary-expression": "error",
			"no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
		}
	},
	{
		files: ["**/*.spec.js", "**/integration/**/*.js"],
		languageOptions: {
			globals: {
				...globals.jest
			}
		}
	}
]
