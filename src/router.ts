import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router'
import PageIndex from '~/pages/index.vue'
import ModalA from './pages/ModalA.vue'
import ModalB from './pages/ModalB.vue'
import { ElDialog } from 'element-plus'
import { h, inject } from 'vue'
// import ModalRoute from './ModalRoute.vue'

const sleep = () => new Promise(resolve => setTimeout(resolve, 1000))
const defineModalRoute = (route: RouteRecordRaw & { name: string }) => {
  route.meta = {
    modal: true,
  }
  route.component.__route_modal_name = route.name
  return route
}
export const router = createRouter({
  routes: [
    {
      name: 'Index',
      path: '/',
      component: PageIndex,
      children: [
        defineModalRoute({
          name: 'ModalA',
          path: 'modal-a',
          component: ModalA,
        }),
        defineModalRoute({
          name: 'ModalB',
          path: 'modal-b',
          component: ModalB,
        }),
      ],
    },
    { name: 'WithChildren', path: '/with-children', children: [] },
  ],
  history: createWebHistory(),
})
