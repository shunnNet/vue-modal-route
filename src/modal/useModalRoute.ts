import { computed, reactive, Ref, ref, RendererElement, RendererNode, toValue, VNode } from 'vue'
import { useRoute, useRouter, RouteLocationRaw } from 'vue-router'
import { useModalRouteContext } from './modalRouteContext'
import { Rejection } from './rejection'

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

export const defineModalDatas = (modalDatas: any) => modalDatas

// TODO: cancel getModalData when visiblity changed
export const useModalRoute = (parentRoute: any) => {
  const route = useRoute()
  const router = useRouter()
  const componentMap: TModalMap = reactive({})
  const { pop } = useModalRouteContext()

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
      await router.replace({ name: toValue(parentRoute).name })
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
        get: () => {
          return route.name === name && _visible.value
        },
        set: value => setVisible(name, value, _visible),
      })
      const getModalData = typeof modalData === 'function'
        ? { getModalData: modalData, mode: 'beforeVisible' }
        : modalData
      const data = ref({})
      const loading = ref(false)

      const _getModalData = async () => {
        const modal = componentMap[name]

        const createRejection = (
          mode: 'replace' | 'push' = 'replace',
          route: RouteLocationRaw = toValue(parentRoute),
        ) => new Rejection(mode, router, route)

        if (modal.getModalData?.mode === 'afterVisible') {
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
        else {
          const response = await modal.getModalData.getModalData(pop(name), createRejection)
          if (Rejection.isRejection(response)) {
            response.run()
            return
          }
          data.value = response
          modal._visible = true
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
