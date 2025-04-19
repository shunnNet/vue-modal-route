import { createWebHistory, createRouter } from "vue-router";
import { routes, handleHotUpdate } from "vue-router/auto-routes"
import { applyModalPrefixToRoutes, createModalRoute } from "@vmr/vue-modal-route"
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
