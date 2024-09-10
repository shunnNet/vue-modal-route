import { createWebHistory, createRouter } from 'vue-router'
import PageIndex from '~/pages/index.vue'
import ModalA from './pages/ModalA.vue'
import ModalB from './pages/ModalB.vue'
import { createModalRouteContext } from './modal'
import HashModalA from './pages/HashModalA.vue'
import QueryModalA from './pages/QueryModalA.vue'
import QueryModalB from './pages/QueryModalB.vue'

export const router = createRouter({
  routes: [
    {
      name: 'Index',
      path: '/',
      component: PageIndex,
      children: [
        {
          name: 'ModalA',
          path: 'modal-a',
          component: ModalA,
          meta: {
            modal: true,
          },
        },

        {
          name: 'ModalB',
          path: 'modal-b',
          component: ModalB,
          meta: {
            modal: true,
          },
        },
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

export const modalRoute = createModalRouteContext({
  router,
  query: [
    {
      name: 'query-modal-a',
      component: QueryModalA,
    },
    {
      name: 'query-modal-b',
      component: QueryModalB,
    },
  ],
  hash: [
    {
      name: 'hash-modal-a',
      // TODO: make path no effect
      path: 'hash-modal-a',
      component: HashModalA,
      meta: {
        modal: true,
      },
    },
  ],

})
