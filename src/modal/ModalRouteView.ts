import { defineComponent, h, PropType, toRef, watch, Component, computed, reactive, ref, RendererElement, RendererNode, toValue, VNode } from 'vue'
import { matchedRouteKey } from 'vue-router'
import { ensureInjection, isPlainObject } from './helpers'
import { modalRouteContextKey, useModalRoute } from './modalRoute'
import { Rejection } from './rejection'
import { useRouter, RouteLocationRaw } from 'vue-router'

export type TComponent = VNode<RendererNode, RendererElement, {
  [key: string]: any
}> | Component
type TModalMap = Record<string, {
  _component: TComponent
  active: boolean
  props: Record<string, any>
  loading: boolean
  setActive: (value: boolean) => Promise<void>
  _getModalProps: () => Promise<void>
  _active: boolean
  slots: Record<string, any>
}>

const setupModalRoute = (
  parentRoute: any,
) => {
  const { pop, getModalItem } = ensureInjection(modalRouteContextKey, 'ModalRoute must be used inside a ModalRoute component')
  const { closeModal, isModalActive } = useModalRoute()

  const router = useRouter()
  const componentMap: TModalMap = reactive({})

  const createActive = (
    defineActive: () => boolean,
    closeAction: () => Promise<void>,
  ) => {
    const _active = ref(false)
    const active = computed({
      get: () => defineActive() && _active.value,
      set: value => setActive(value),
    })
    const setActive = async (value: boolean) => {
      if (value) {
        // await activeAction()
        _active.value = true
      }
      else {
        // TODO: when no matched route
        // [Vue Router warn]: router.resolve() was passed an invalid location. This will fail in production.
        // handle visible when router.push is failed
        // TODO: handle push/replace failed
        // TODO: allow set mode ?
        await closeAction()
        _active.value = false
      }
    }
    return { active, setActive, _active }
  }

  const setModal = (name: string, component: TComponent) => {
    if (componentMap[name]) {
      componentMap[name]._component = component
    }
    else {
      const modalItem = getModalItem(name)
      const { active, setActive, _active } = createActive(
        () => isModalActive(name),
        async () => closeModal(name),
      )
      watch(active, (value) => {
        if (value === false) {
          _active.value = false
        }
      })

      const createRejection = (
        mode: 'replace' | 'push' = 'replace',
        route: RouteLocationRaw = toValue(parentRoute),
      ) => new Rejection(mode, router, route)

      const getProps = typeof modalItem?.options?.props?.handler === 'function'
        ? modalItem.options.props.handler
        : isPlainObject(modalItem?.options?.props)
          ? () => modalItem.options?.props
          : null

      const propsOption = {
        get: getProps
          ? () => getProps(pop(name), createRejection)
          : () => pop(name),
        mode: modalItem?.options?.props?.mode || 'beforeVisible',
      }

      const props = ref({})
      const loading = ref(false)

      const _getModalProps = async () => {
        if (propsOption?.mode === 'afterVisible') {
          setActive(true)
          loading.value = true
          const response = await propsOption.get()
          if (Rejection.isRejection(response)) {
            setActive(false)
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
          console.log('response', response)
          props.value = response || {}
          setActive(true)
        }
      }

      const modalSlots = isPlainObject(modalItem?.options?.slots)
        ? modalItem.options.slots
        : {}

      // TODO: How to handle reactive unwrap type ?
      componentMap[name] = {
        _component: component,
        active: active as unknown as boolean,
        setActive,
        loading: loading as unknown as boolean,
        props,
        _getModalProps,
        slots: modalSlots,
        _active: _active as unknown as boolean,
      }
    }

    componentMap[name]._getModalProps()
  }

  return { setModal, componentMap }
}

export default defineComponent({
  props: {
    components: {
      type: Array as PropType<TComponent[] | { modalName: string, component: TComponent }[]>,
      default: () => [],
    },
    parent: {
      type: Object,
      default: null,
    },
    modalType: {
      type: String as PropType<'path' | 'hash' | 'query'>,
      required: true,
    },
  },

  setup(props) {
    const { setModal, componentMap } = setupModalRoute(toRef(() => props.parent))
    const matchedRoute = ensureInjection(matchedRouteKey, 'ModalRoute component must be used inside a router view')
    const { getModalItemUnsafe } = ensureInjection(modalRouteContextKey, 'ModalRoute must be used inside a ModalRoute component')

    const setupModalIfExist = (cmp: TComponent, name?: string) => {
      if (!cmp) {
        return
      }
      const _name = name || matchedRoute.value?.name as string
      const modal = getModalItemUnsafe(_name)

      if (modal && modal.type === props.modalType) {
        setModal(_name, cmp)
      }
    }

    props.components.filter(Boolean).forEach(
      cmp => 'modalName' in cmp
        ? setupModalIfExist(cmp.component, cmp.modalName)
        : setupModalIfExist(cmp),
    )

    watch(() => props.components, (val) => {
      if (!val.length) {
        return
      }
      val.filter(Boolean).forEach(cmp => 'modalName' in cmp
        ? setupModalIfExist(cmp.component, cmp.modalName)
        : setupModalIfExist(cmp),
      )
    })
    return () => {
      return Object.entries(componentMap).map(([name, { _component }]) => {
        const modal = componentMap[name]
        return h(_component, {
          ...modal.props,
          'modelValue': modal.active,
          'onUpdate:modelValue': (value: boolean) => modal.active = value,
          'loading': modal.loading,
        }, modal.slots)
      })
    }
  },
})
