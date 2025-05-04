import { defineModalRoute, defineModalQueryRoute } from '@vmrh/core'
import ModalQueryA from './components/ModalQueryA.vue'

export const ModalA = defineModalRoute<string>(
  'modal-a',
  () => import('./pages/page-single-modal/ModalA.vue'),
  { direct: true },
)

export const ModalB = defineModalRoute(
  'modal-b/:id',
  () => import('./pages/page-single-modal/ModalB.vue'),
)

export const CrossModalA = defineModalRoute(
  'cross-modal-a',
  () => import('./pages/cross-page/ModalA.vue'),
)

export const QueryModalA = defineModalQueryRoute(
  'query-modal-a',
  ModalQueryA,
)

export const ModalTest = defineModalRoute(
  'modal-test',
  () => import('./pages/ModalTest.vue'),
)
