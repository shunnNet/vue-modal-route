import { createModalRoute } from '@vmr/vue-modal-route'
import { ModalA, ModalB, QueryModalA } from './modals'
import { defineAsyncComponent } from 'vue'

export const router = createModalRoute({
  layout: {
    default: defineAsyncComponent(() => import('~/components/LayoutDialog')),
    // default: LayoutDialog,
  },
  routes: [
    {
      name: 'PageSingleModal',
      path: '/',
      component: () => import('./pages/page-single-modal/index.vue'),
      children: [
        ModalA.route(),
        ModalB.route([
          {
            name: 'ModalPageSingleBChild',
            path: 'child',
            component: () => import('./pages/page-single-modal/ModalB/child.vue'),
          },
        ]),
        {
          name: 'ModalTest',
          path: '/modal-test/:foo',
          component: () => import('./pages/ModalTest.vue'),
          meta: {
            modal: true,
            direct: true
          },
          children: [
            {
              name: "ModalTestChild",
              path: 'test',
              component: () => import('./pages/PageTest.vue'),
            },
            {
              name: "ModalTestChild2",
              path: 'test2',
              component: () => import('./pages/PageTest2.vue'),
            }
          ]
        },
      ],
    },
    {
      name: 'PageCrossPage',
      path: '/cross-page',
      component: () => import('./pages/cross-page/index.vue'),
      children: [
        {
          name: 'ModalCrossPageA',
          path: 'modal-a',
          component: () => import('./pages/cross-page/ModalA.vue'),
          meta: {
            modal: true,
          },
        },
      ],
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
              children: [
                {
                  name: 'ModalNestedBChild',
                  path: 'child',
                  component: () => import('./pages/nested/ModalB/child-path.vue'),
                },
              ],
            },

          ],
        },
      ],
    },
    {
      name: 'PagePrepare',
      path: '/prepare',
      component: () => import('./pages/prepare-open/index.vue'),
      children: [
        {
          name: 'PagePrepareModalC',
          path: 'modal-c',
          component: () => import('./pages/prepare-open/ModalC.vue'),
          meta: {
            modal: true,
            direct: true,
          },

        },
      ],
    },
  ],
  global: [
    {
      name: 'ModalGlobalA',
      path: 'modal-global-a',
      component: () => import('~/components/ModalGlobalA.vue'),
      meta: {
        modal: true,
        direct: true,
      },
      children: [
        {
          name: 'ModalHashB',
          path: 'modal-hash-b',
          component: () => import('~/pages/cross-page/ModalA.vue'),
          meta: {
            modal: true,
          },
        },
        // {
        //   name: 'ModalHashAChild',
        //   path: 'child',
        //   component: () => import('~/components/ModalHashAChild.vue'),
        // },
      ],
    },
  ],
  query: [
    QueryModalA.route(),
  ],
})