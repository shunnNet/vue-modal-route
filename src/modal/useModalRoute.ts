import { computed, reactive, Ref, ref, RendererElement, RendererNode, VNode } from 'vue'
import { Router, useRoute, useRouter, RouteLocationRaw } from 'vue-router'
import { useModalRouteContext } from './modalRouteContext'

class Rejection {
  mode: 'replace' | 'push' = 'replace'
  router: Router
  route: RouteLocationRaw
  constructor(
    mode: 'replace' | 'push' = 'replace',
    router: Router,
    route: RouteLocationRaw,
  ) {
    this.mode = mode
    this.route = route
    this.router = router
  }

  run() {
    return this.router[this.mode](this.route)
  }

  static isRejection(value: any): value is Rejection {
    return value instanceof Rejection
  }
}
export type TComponent = VNode<RendererNode, RendererElement, {
  [key: string]: any
}>
type TModalMap = Record<string, {
  _component: TComponent
  visible: boolean
  getModalData: any
  data: Record<string, any>
  loading: boolean
  _visible: boolean
  _getModalData: () => Promise<void>
}>

type TModalData = Record<string, {
  getModalData: (data: Record<string, any>, reject: TCreateRejection) => Record<string, any> | Rejection
  mode: 'beforeVisible' | 'afterVisible'
}>

type TCreateRejection = (
  mode?: 'replace' | 'push',
  route?: RouteLocationRaw,
) => Rejection

export const defineModalDatas = (modalDatas: TModalData) => modalDatas

// TODO: cancel getModalData when visiblity changed
export const useModalRoute = () => {
  const route = useRoute()
  const router = useRouter()
  const componentMap: TModalMap = reactive({})
  const { pop, backToParent, getModalRoute } = useModalRouteContext()

  const setVisible = async (name: string, visible: boolean, _visible: Ref<boolean>) => {
    if (visible) {
      await router.push({ name })
      _visible.value = true
    }
    else {
      // TODO: when no matched route
      // [Vue Router warn]: router.resolve() was passed an invalid location. This will fail in production.
      // handle visible when router.push is failed
      // TODO: handle push/replace failed
      // TODO: allow set mode ?
      await backToParent(name)
      _visible.value = false
    }
  }
  const setComponent = (name: string, component: TComponent, modalData: any) => {
    if (componentMap[name]) {
      componentMap[name]._component = component
    }
    else {
      const _visible = ref(false)
      const visible = computed({
        get: () => route.name === name && _visible.value,
        set: value => setVisible(name, value, _visible),
      })
      const getModalData = typeof modalData === 'function'
        ? { getModalData: modalData, mode: 'beforeVisible' }
        : modalData

      const data = ref({})
      const loading = ref(false)

      const _getModalData = async () => {
        const modal = componentMap[name]

        const parentRoute = getModalRoute(name).parent
        const createRejection = (
          mode: 'replace' | 'push' = 'replace',
          route: RouteLocationRaw = parentRoute,
        ) => new Rejection(mode, router, route)

        if (modal.getModalData?.mode === 'beforeVisible') {
          const response = await modal.getModalData.getModalData(pop(name), createRejection)
          if (Rejection.isRejection(response)) {
            response.run()
            return
          }
          data.value = response
          modal._visible = true
        }
        else if (modal.getModalData?.mode === 'afterVisible') {
          modal._visible = true
          loading.value = true
          const response = await modal.getModalData.getModalData(pop(name), createRejection)
          if (Rejection.isRejection(response)) {
            modal._visible = false
            loading.value = false
            response.run()
            return
          }
          data.value = response
          loading.value = false
        }
      }

      // TODO: How to handle reactive unwrap type ?
      componentMap[name] = {
        _component: component,
        visible: visible as unknown as boolean,
        _visible: _visible as unknown as boolean,
        loading: loading as unknown as boolean,
        data,
        _getModalData,
        getModalData,
      }
    }

    componentMap[name]._getModalData()
  }

  return { setComponent, componentMap }
}
