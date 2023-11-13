import { createApp } from "vue"
import { createPinia } from "pinia"
import router from "./router"
import App from "./App"

import "./styles/app.scss"
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/atom-one-dark.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount("#app")
