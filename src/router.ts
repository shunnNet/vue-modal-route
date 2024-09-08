import { createWebHistory, createRouter } from 'vue-router'
import PageIndex from '~/pages/index.vue'
import ModalA from './pages/ModalA.vue'
import ModalB from './pages/ModalB.vue'
import { createModalRouteContext, defineHashModalRoute, defineModalRoute } from './modal'
import HashModalA from './pages/HashModalA.vue'

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
    {
      name: 'Test',
      path: '/test',
      component: () => import('./pages/test.vue'),
    },
  ],
  history: createWebHistory(),
})

const globalModalRoutes = defineHashModalRoute([
  defineModalRoute({
    name: 'hash-modal-a',
    path: 'hash-a',
    component: HashModalA,
  }),
])

export const modalRouteContext = createModalRouteContext(router, globalModalRoutes)
