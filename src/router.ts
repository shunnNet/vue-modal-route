import { createWebHistory, createRouter } from 'vue-router'
import { createModalRoute } from './modal'
import ModalQueryA from '~/components/ModalQueryA.vue'

const routerHistory = createWebHistory()
export const router = createRouter({
  history: routerHistory,
  routes: [
    {
      name: 'PageSingleModal',
      path: '/',
      component: () => import('./pages/page-single-modal/index.vue'),
      children: [
        {
          name: 'ModalPageSingleA',
          path: 'modal-a',
          component: () => import('./pages/page-single-modal/ModalA.vue'),
          meta: {
            modal: true,
          },
        },
        {
          name: 'ModalPageSingleB',
          path: 'modal-b/:id',
          component: () => import('./pages/page-single-modal/ModalB.vue'),
          meta: {
            modal: true,
          },
          children: [
            {
              name: 'ModalPageSingleBChild',
              path: 'child',
              component: () => import('./pages/page-single-modal/ModalB/child.vue'),
            },
          ],
        },
      ],
    },
    {
      name: 'PageCrossPage',
      path: '/cross-page',
      component: () => import('./pages/cross-page/index.vue'),
    },
    {
      name: 'PageNestedModal',
      path: '/nested',
      component: () => import('./pages/nested/index.vue'),
      children: [
        {
          name: 'ModalNestedA',
          path: 'modal-a',
          component: () => import('./pages/nested/ModalA.vue'),
          meta: {
            modal: true,
          },
          children: [
            {
              name: 'ModalNestedB',
              path: 'modal-b',
              component: () => import('./pages/nested/ModalB.vue'),
              meta: {
                modal: true,
              },
            },

          ],
        },
      ],
    },
  ],
})

export const modalRoute = createModalRoute({
  router,
  routerHistory,
  hash: [
    {
      name: 'ModalHashA',
      path: 'modal-hash-a',
      component: () => import('~/components/ModalHashA.vue'),
      meta: {
        modal: true,
        direct: true,
      },
    },
  ],
  query: [
    {
      name: 'ModalQueryA',
      component: ModalQueryA,
    },
  ],
})
