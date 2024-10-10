import { defineComponent, h, PropType, watch, computed, reactive, ref, RendererElement, RendererNode, VNode, inject } from 'vue'
import { matchedRouteKey } from 'vue-router'
import { ensureInjection, isPlainObject } from './helpers'
import { modalRouteContextKey, useModalRoute } from './modalRoute'
import { TComponent } from './types'

type TModalMap = Record<string, {
  _component: TComponent
  active: boolean
  props: Record<string, any>
  loading: boolean
  setActive: (value: boolean) => Promise<void>
  _getModalProps: () => void
  _active: boolean
  slots: Record<string, any>
}>

const setupModalRoute = () => {
  const { pop, getModalItem } = ensureInjection(modalRouteContextKey, 'ModalRoute must be used inside a ModalRoute component')
  const { closeModal, isModalActive } = useModalRoute()

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
    const modalItem = getModalItem(name)
    if (componentMap[name]) {
      componentMap[name]._component = component
    }
    else {
      const { active, setActive, _active } = createActive(
        () => isModalActive(name),
        async () => closeModal(name),
      )
      watch(active, (value) => {
        if (value === false) {
          _active.value = false
        }
      })

      const getProps = typeof modalItem?.options?.props?.handler === 'function'
        ? modalItem.options.props.handler
        : isPlainObject(modalItem?.options?.props)
          ? () => modalItem.options?.props
          : null

      const propsOption = {
        get: getProps
          ? () => getProps(pop(name))
          : () => pop(name),
      }

      const props = ref({})
      const loading = ref(false)

      const _getModalProps = () => {
        setActive(true)
        const response = propsOption.get()
        props.value = response || {}
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

  setup(props, { slots }) {
    const { setModal, componentMap } = setupModalRoute()
    const { closeModal } = useModalRoute()
    const matchedRoute = inject(matchedRouteKey, null)
    const {
      getModalItemUnsafe,
      setModalReturnValue,
    } = ensureInjection(modalRouteContextKey, 'ModalRoute must be used inside a ModalRouteContext')

    const setupModalIfExist = (cmp: TComponent, name?: string) => {
      if (!cmp) {
        return
      }
      const _name = name || matchedRoute?.value?.name as string
      if (!_name) {
        throw new Error('modalName not provided')
      }
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
        const _slots = Object.fromEntries(
          Object.entries(slots).flatMap(([key, value]) => {
            const [parsedKey, slotName] = key.split('-')
            if (parsedKey === name) {
              return [[slotName, value]]
            }
            else {
              return []
            }
          }),
        )
        const modal = componentMap[name]
        return h(_component, {
          ...modal.props,
          'modelValue': modal.active,
          'onUpdate:modelValue': (value: boolean) => modal.active = value,
          'loading': modal.loading,
          'onReturn': ($event: any) => {
            setModalReturnValue(name, $event)
            closeModal(name)
          },
        }, Object.assign(_slots, modal.slots))
      })
    }
  },
})
