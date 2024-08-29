import ModalC from '~/pages/ModalC.vue'
import ModalD from '~/pages/ModalD.vue'

export const routes = [
  {
    name: 'modalc',
    component: ModalC,
    children: [
      {
        name: 'modald',
        component: ModalD,
      },
    ],
  },
]
