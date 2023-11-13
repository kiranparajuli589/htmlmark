import { createRouter, createWebHashHistory } from "vue-router"

const routes = [
	{ path: '/', component: () => import("@/views/Home") },
	{ path: '/about', component: () => import("@/views/About") },
	{ path: '/demo', component: () => import("@/views/Demo") },
]

const router = createRouter({
	// 4. Provide the history implementation to use. We are using the hash history for simplicity here.
	history: createWebHashHistory(),
	routes, // short for `routes: routes`
})

export default router
