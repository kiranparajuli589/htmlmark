module.exports = {
	root: true,
	env: {
		"browser": true,
		"node": true,
	},
	extends: [
		"plugin:vue/vue3-essential",
		"eslint:recommended"
	],
	parserOptions: {
		ecmaVersion: "latest"
	},
	rules: {
		semi: ["error", "never"],
		quotes: ["error", "double"],
		"no-console": ["error", {allow: ["warn", "error", "info"]}],
		indent: ["error", "tab"],
	}
}
