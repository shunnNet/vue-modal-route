import { createWebHistory, createRouter } from "vue-router";
import { routes, handleHotUpdate } from "vue-router/auto-routes"
import { applyModalPrefixToRoutes, createModalRoute } from "@vmr/core"
import { ModalHashA } from "./components/HighlightText.vue"

const history = createWebHistory()
console.log(routes);
export const router = createRouter({
  history,
  routes: applyModalPrefixToRoutes(routes),
})


export const modalRoute = createModalRoute({
  router,
  history
})



if (import.meta.hot) {
  handleHotUpdate(router)
}
