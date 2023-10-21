import { createApp } from "vue"
import { createPinia } from "pinia"

import App from "./App"

import "./styles/app.scss"
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/atom-one-dark.css';

const app = createApp(App)

app.use(createPinia())

app.mount("#app")
