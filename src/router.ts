import { createWebHistory, createRouter, RouterHistory, HistoryState } from 'vue-router'
import PageIndex from '~/pages/index.vue'
import ModalA from './pages/ModalA.vue'
import ModalB from './pages/ModalB.vue'
import { createModalRoute } from './modal'
import HashModalA from './pages/HashModalA.vue'
import QueryModalA from './pages/QueryModalA.vue'
import QueryModalB from './pages/QueryModalB.vue'
import ModalE from './pages/ModalE.vue'

const createWebModalHistory: () => RouterHistory = () => {
  const webHistory = createWebHistory()
  const _replace = webHistory.replace
  const _push = webHistory.push

  const push: RouterHistory['push'] = (path: string, data?: HistoryState) => {
    const _data = {
      vmr: window.history.state?.vmr ?? {},
      ...(data ?? {}),
    }
    _push(path, _data)
  }

  const replace: RouterHistory['replace'] = (path: string, data?: HistoryState) => {
    const _data = {
      vmr: window.history.state?.vmr ?? {},
      ...(data ?? {}),
    }
    _replace(path, _data)
  }
  // TODO: Why ?
  webHistory.push = push
  webHistory.replace = replace
  return webHistory
}
const routerHistory = createWebModalHistory()

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
          children: [
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

      ],
    },
    {
      name: 'Test',
      path: '/test',
      component: () => import('./pages/test.vue'),
      children: [
        {
          name: 'ModalE',
          path: 'modal-e',
          component: ModalE,
          meta: {
            modal: true,
          },
        },
      ],
    },
    {
      name: 'PathHashA',
      path: '/path-hash-a',
      component: () => import('./pages/path-hash/path-hash-a.vue'),
      children: [
        {
          name: 'ModalPH1',
          path: 'modal-ph1',
          component: () => import('./pages/path-hash/ModalPH1.vue'),
          meta: {
            modal: true,
          },
        },
      ],
    },
  ],
  history: routerHistory,
})

export const modalRoute = createModalRoute({
  direct: true,
  router,
  routerHistory,
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
