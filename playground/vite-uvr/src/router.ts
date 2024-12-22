import { createWebHistory, createRouter }  from "vue-router";
import { routes, handleHotUpdate } from "vue-router/auto-routes"
import { transformToModalRoute, createModalRoute }  from "@vmr/vue-modal-route"

const history = createWebHistory()
console.log(routes);
export const router = createRouter({
  history,
  routes: transformToModalRoute(routes),
})


export const modalRoute = createModalRoute({
  router,
  history
})



if (import.meta.hot) {
  handleHotUpdate(router)
}
