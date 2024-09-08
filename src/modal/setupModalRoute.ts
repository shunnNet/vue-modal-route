import { computed, reactive, Ref, ref, RendererElement, RendererNode, toValue, VNode } from 'vue'
import { useRoute, useRouter, RouteLocationRaw } from 'vue-router'
import { modalRouteContextKey } from './modalRouteContext'
import { Rejection } from './rejection'
import { ensureInjection, isPlainObject } from './helpers'

export type TComponent = VNode<RendererNode, RendererElement, {
  [key: string]: any
}>
type TModalMap = Record<string, {
  _component: TComponent
  visible: boolean
  props: Record<string, any>
  loading: boolean
  _visible: boolean
  _getModalProps: () => Promise<void>
  slots: Record<string, any>
}>

// TODO: cancel getModalProps when visiblity changed
export const setupModalRoute = (parentRoute: any) => {
  // TODO: enhance error message
  const { pop, store } = ensureInjection(modalRouteContextKey, 'ModalRoute must be used inside a ModalRoute component')

  const route = useRoute()
  const router = useRouter()
  const componentMap: TModalMap = reactive({})

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

  const setModal = (name: string, component: TComponent) => {
    if (componentMap[name]) {
      componentMap[name]._component = component
    }
    else {
      const modalItem = store[name]
      const _visible = ref(false)
      const visible = computed({
        get: () => {
          return route.name === name && _visible.value
        },
        set: value => setVisible(name, value, _visible),
      })

      const createRejection = (
        mode: 'replace' | 'push' = 'replace',
        route: RouteLocationRaw = toValue(parentRoute),
      ) => new Rejection(mode, router, route)

      const getProps = typeof modalItem.options?.props?.handler === 'function'
        ? modalItem.options.props.handler
        : isPlainObject(modalItem.options?.props)
          ? () => modalItem.options?.props
          : null

      const propsOption = {
        get: getProps
          ? () => getProps(pop(name), createRejection)
          : () => pop(name),
        mode: modalItem.options?.props?.mode || 'beforeVisible',
      }

      const props = ref({})
      const loading = ref(false)

      const _getModalProps = async () => {
        const modal = componentMap[name]

        if (propsOption?.mode === 'afterVisible') {
          modal._visible = true
          loading.value = true
          const response = await propsOption.get()
          if (Rejection.isRejection(response)) {
            modal._visible = false
            loading.value = false
            response.run()
            return
          }
          props.value = response || {}
          loading.value = false
        }
        else {
          const response = await propsOption.get()
          if (Rejection.isRejection(response)) {
            response.run()
            return
          }
          props.value = response || {}
          modal._visible = true
        }
      }

      const modalSlots = isPlainObject(modalItem.options?.slots)
        ? modalItem.options?.slots
        : {}

      // TODO: How to handle reactive unwrap type ?
      componentMap[name] = {
        _component: component,
        visible: visible as unknown as boolean,
        _visible: _visible as unknown as boolean,
        loading: loading as unknown as boolean,
        props,
        _getModalProps,
        slots: modalSlots,
      }
    }

    componentMap[name]._getModalProps()
  }

  return { setModal, componentMap }
}
