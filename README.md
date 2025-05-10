# vue-modal-route
[![npm version](https://img.shields.io/npm/v/@crazydos/@vmrh/core.svg)](https://www.npmjs.com/package/@crazydos/@vmrh/core)
[![npm downloads](https://img.shields.io/npm/dm/@crazydos/@vmrh/core.svg)](https://www.npmjs.com/package/@crazydos/@vmrh/core)
[![License](https://img.shields.io/github/license/shunnNet/vue-modal-route.svg)](https://github.com/shunnNet/vue-modal-route/blob/main/LICENSE)

`vue-modal-route` is a Vue 3 package that integrates modal state management with vue-router. It allows you to control modals via routes and pass complex data effortlessly — making modal handling more declarative, shareable, and router-friendly.

Unlike Next.js-style modals, this package takes a different approach. If you're looking for route-driven modals similar to those in Next.js, consider using [nuxt-page-plus](https://nuxt-pages-plus.pages.dev/routing/modal-routes).

## Features
This package is designed for more flexible modal scenarios and comes with several key features:

- ✅ Use full vue-router capabilities inside your modal components — including router-view, navigation guards, and nested routes.
- 🔗 Open modals via URL navigation, enabling deep linking and browser history support.
- 📦 Pass complex data objects to modals, beyond the limitations of URL-encoded types.
- 🧩 Supports a wide range of use cases — from simple alerts, login dialogs, to modals embedded in single-page views.
- 👍 Not limited to a specific ModalUI library, you can use any ModalUI.

---
## Online example & playground
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/shunnNet/vmrh-vite-playground)

## Why and How ?
If you need the motivation and implementation details for vue-modal-route, you can refer to this article.

https://dev.to/shunnnet/implementing-vue-modal-route-58ff

## Usage

### Quick Start
Install it. 

And your project must already include vue-router:

```sh
npm install @vmrh/core vue-router
```

To get started, use `createModalRoute` to configure both `vue-router` and `@vmrh/core`.

Set up any page as usual, and define modal routes under the children property of that route. For example:

```ts
// src/router.ts
import { createModalRoute } from '@vmrh/core'

export const router = createModalRoute({
  routes: [
    {
      name: "Index",
      path: '/',
      component: () => import("./pages/Index.vue"),
      children: [
        {
          // <-- Modal route
          name: "MyIndexModal", // <-- Modal route's name
          path: 'index-modal',
          component: () => import("./pages/IndexModal.vue"),
          meta: {
            modal: true, // <-- This makes it modal route.
            direct: true, // <-- This enable diretly access from url.
          }
        }
      ]
    }
  ]
})
```

> [!NOTE]
> When using `createModalRoute`, **all routes must have a name**, and **the name must be of type string**.

Then, register the router as a plugin in your app just like you would with regular `vue-router`:

```ts
import App from './App.vue'
import { createApp } from 'vue'

const app = createApp(App)
app
  .use(router)
  .mount('#app')
```

And add `<RouterView>` to your App.vue.

```vue
<template>
  <RouterView />
</template>
```

Next, set up your modal route component (in the previous example, this would be `./pages/IndexModal.vue`).

You can use any modal component inside your modal route.
By calling `useCurrentModal`, you can access the current modal’s visible state via `modelValue`, and pass it into your own modal like this:

```vue
<!-- ./pages/IndexModal.vue -->
<script setup lang="ts">
import Modal from './path-to-my-modal'
import { useCurrentModal } from '@vmrh/core'

const { modelValue } = useCurrentModal()
</script>

<template>
  <Modal v-model="modelValue" title="Modal Route">
    <p> Hello World</p>
  </Modal>
</template>
```

In `Index.vue`, just like how you use `<RouterView>` to render child routes,
you'll need to add `<ModalRouterView>` in order to render the corresponding modal route.

```vue
<!-- ./pages/Index.vue -->
<template>
  <div>
    <h1>Index</h1>
    <ModalRouterView />
  </div>
</template>
```

That’s it — setup is complete!
You can now open the modal by navigating to the `/index-modal` route.

### Modal Types
In `vue-modal-route`, there are three types of modals, each with different characteristics designed for specific use cases:

- `Path`: Modals that are tied to a specific page and bound to a fixed URL.

- `Global`: Modals that can be opened from any page, typically used for global features like login, preferences, etc. They do not have a fixed URL.

- `Query`: Modals that can also be opened from any page, often used for functional dialogs like alerts or confirmations. These are triggered using specific query strings.

In the example above, we demonstrated a path modal, which is associated with a fixed URL.

### Programmatically Open / Close Modal
You can use `useModalRoute` to open, close, or configure a modal route — from any component, not just the parent.

To interact with a modal route, you must reference it by its route name.

```vue
<script setup lang="ts">
import { useModalRoute } from '@vmrh/core'

const { openModal, closeModal } = useModalRoute()

openModal('modal-name') // use name of the route (e.g `MyIndexModal`)

closeModal('modal-name')

</script>
```

### Props / Data
To pass props to a modal route component, provide a `data` object when calling `openModal`.

```ts
openModal('modal-name', {
  data: {
    message: "Hi from parent."
  }
})
```

Then, receive it as `props` in the modal route component.

```vue
<script setup lang="ts">
const { modelValue } = useCurrentModal()
defineProps<{
  message?: string
}>()
</script>

<template>
  <Modal v-model="modelValue">
    <div>Message: {{ message }} </div>
  </Modal>
</template>
```

### `ReturnValue`
`openModal` returns a promise that resolves when the modal is closed. The resolved value is the `returnValue`.

By default, the `returnValue` is null.

The modal route component can return a value using `closeAndReturn`. When this function is called, the modal will close, and the promise from `openModal` will resolve with the returned value.

```vue
<script setup lang="ts">
const { modelValue, closeAndReturn } = useCurrentModal()
</script>

<template>
  <Modal v-model="modelValue">
    <div>Message: {{ message }} </div>
    <!-- returnValue will be 'Modal returnValue' -->
    <button @click="closeAndReturn('Modal returnValue')">Close with value</button>
  </Modal>
</template>
```

```ts
const returnValue = await openModal('modal-name')

returnValue // 'Modal returnValue'
```

### Params / Hash / Query
You can pass `params`, `query`, and `hash` to `openModal`, which will be used by `router.push`. This is particularly useful when your modal route path is dynamic. For example:

```ts
// dynamic route modal
{
  name: 'modal-name',
  path: 'modal-name/:foo',
  component: () => import('./pages/ModalName.vue'),
  meta: {
    modal: true,
  },
}
```

```ts
openModal('modal-name', {
  params: { foo: 'bar' },
  query: /** ... */,
  hash:  /** ... */,
})
```

### `setupModal`
The `setupModal` function is used to configure **child route modals**. It allows you to define the modal's `slot`, `props`, and initialization strategy.

To set this up, simply call `setupModal` in the parent component.

```vue
<script setup lang="ts">
const {
  // Works like `openModal`, but only open `modal-name` you specified
  open, 
  // Works like `closeModal`, but only close `modal-name` you specified
  close,
  // Computed object. returnValue of `modal-name` you specified
  returnValue
} = setupModal('modal-name')


open({ 
  data: {},
  params: {},
  // ...
}) 
</script>
<template>
  <ModalRouterView />
</template>
```


#### `Props`
Similar to the `data` parameter in the `openModal` function, you can pass `props` to `setupModal` to define the `props` for the modal route component.

```ts
const { open } = setupModal('modal-name', {
  props: {
    foo: 'bar'
  }
})
```

The `data` will be merged into `props`, **with `data` taking precedence over props**.

```ts
const { open } = setupModal('modal-name', {
  props: {
    foo: 'bar'
  }
})
open({
  data: {
    foo: 'bar2'
  }
})

// The final props will be { foo: 'bar2' }
```

Additionally, `props` can accept a function that receives the data passed into `openModal`, allowing you to manually merge them.

```ts
const { open } = setupModal('modal-name', {
  props(data) {
    return {
      message: data.message ?? 'default message'
    }
  }
})
```

`props` can return `ref`, `computed` or `reactive`.

```ts
const msg = ref('default message')
const reactiveObj = reactive({
  message: 'def message',
  name: 'name'
})

const { open } = setupModal('modal-name', {
  props(data) {
    // Props will updated when msg.value changed
    return {
      message: msg.value
    }
  },

  // Props will updated when reactiveObj changed
  props: reactiveObj,
})
```


#### `slots`
You can pass `slots` in two ways:

1. Through the slots property in `setupModal`.
2. By inserting them directly into the `ModalRouterView` slots.

For example, the modal route component might have a `custom` slot.

```vue
<script setup lang="ts">
const { modelValue } = useCurrentModal()

</script>

<template>
  <Modal v-model="modelValue">
    <slot name="custom" :visible="modelValue" />
  </Modal>
</template>
```

The `slots` property accepts a function that returns a vnode (similar to usage with the Vue `h` function).


You can insert the `custom` slot via `setupModal`. 

```ts
setupModal('modal-name', {
  slots: {
    custom: ({ visible }) => h('div', `custom message: ${visible}`)
  }
})
```

Alternatively, you can insert slots directly from `<ModalRouterView>`. To specify the slot, use the `modal-name-[slot-name]` format.


```vue
<template>
    <ModalRouterView>
      <template #modal-name-custom="{ visible }">
        <div>custom message {{ visible }}</div>
      </template>
    </ModalRouterView>
  </div>
</template>
```

When both `setupModal` and `ModalRouterView` define the same slot name, the one in `setupModal` takes precedence.

### Preparing Data Before Modal Open
Modal routes can be opened from another page. In such cases, you might need to prepare data before the modal opens, such as fetching data.

You can use `setupModal` and set `manual` option to `true` to prevent modal from opening immediately. 

For example, consider opening the modal route `/user/info`, which is a child route of `/user`, from the homepage `/`.

```ts
// homepage `/`

openModal(`UserInfo`)
```

In `/user`, you may want to prepare data before the modal opens and display it once the data is ready. Here’s how you can do it:

```ts
const userMeta = ref({
  authorized: false
})
const { open } = setupModal('UserInfo', {
  props: userMeta
})

onMouted(() => {
  fetchUserMeta().then(res => {
    userMeta.value.authorized = res.authorized
  })
})
```

To prevent the modal from opening before the data is fetched, pass the option `manual: true` to `setupModal`.

```ts
const { open } = setupModal('UserInfo', {
  manual: true, // <-- prevent modal from opening
  props: userMeta,
})
```

Then, call `unlock` after the data is ready, and the modal will open.

```ts
const { open, unlock } = setupModal('UserInfo', {
  manual: true, // <-- prevent modal from opening
  props: userMeta,
})

onMouted(() => {
  fetchUserMeta().then(res => {
    userMeta.value.authorized = res.authorized
    unlock() // modal show up when `unlock` called
  })
})
```

### Route Setup
To setup a route for a modal route, for example:

```ts
export const router = createModalRoute({
  routes: [
    {
      name: "Index", // <-- Base route
      path: '/',
      component: () => import("./pages/Index.vue"),
      children: [
        {
          name: "MyIndexModal", // <-- Modal route
          path: 'index-modal',
          component: () => import("./pages/IndexModal.vue"),
          meta: {
            modal: true,
          }
        }
      ]
    }
  ]
})
```

A route will be treated as a modal route if it satisfies the following conditions:

1. It has `name` (string)
2. It has a `component` or `components.default`
3. It has `meta.modal: true` 

#### Base Route
A modal route must have a **base route**. In the example above, the base route is `Index`.

The **base route** is required because, when the modal is closed, the system needs a route to navigate back to. Which is **base route**.

The base route must have a `component` or `components.default` defined to display content when the modal is not open.

#### Route Must Have a Name
Currently, modal routes heavily rely on the route name for navigation. Therefore, you must define a name for every route.

### Allow / Disallow Direct Access from URL
By default, modal routes do not allow direct access via URL.

To enable direct access, add `direct: true` to the route’s meta.

```ts
export const router = createModalRoute({
  routes: [
    {
      name: "Index", // <-- Base route. If MyIndexModal does not allow directly access, user will be redirected to here.
      path: '/',
      component: () => import("./pages/Index.vue"),
      children: [
        {
          name: "MyIndexModal",
          path: 'index-modal',
          component: () => import("./pages/IndexModal.vue"),
          meta: {
            modal: true,
            direct: true, // <--- This allow accessing from url
          }
        }
      ]
    }
  ]
})
```

If direct access is not enabled for a modal route, attempting to navigate to its URL and hitting enter will redirect you to its** base route** (which is `Index` in this example). If the **base route is also a modal route** that disallows direct access, you will be redirected again to its own base route, and so on.

### Global Modal
A global modal route works similarly to a path modal, except that it can be displayed on any page without transitioning to another page.

The most common use case for a global modal is a `login` modal.

#### Setup Global Modal
To set up a global modal, pass the routes to the `global` option in `createModalRoute`.

```ts
export const router = createModalRoute({
  routes: [
    // ....
  ],
  global: [
    {
      name: 'Login',
      path: 'login',
      component: () => import('~/components/Login.vue'),
      meta: {
        modal: true,
      },
    },
  ],
})
```

Then, place `<ModalGlobalView>` outside of `<RouterView>`, typically at the root of the component tree, such as in `<App>`

```vue
<!-- App.vue -->
<template>
    <main>
      <RouterView />
    </main>
    <ModalGlobalView />
</template>
```
The global modal route component functions similarly to a path modal route component. For example:

```vue
<!-- Login.vue -->
<script setup lang="ts">
const { modelValue } = useCurrentModal()
</script>

<template>
  <Modal v-model="modelValue">
    <h2>Login</div>
    <LoginForm />
  </Modal>
</template>
```

That's it, you can now open the login modal from anywhere.

```vue
<!-- /some/path/any -->
<script setup lang="ts">
const onLoginButtonClick = () => {
  openModal('Login')
}
</script>
```

#### Path of Global Modal
The global modal route path will be prefixed with `_modal` and appended to the current path. For example, if the current path is `/user/info` and you open a global modal route with the path `/login`, the resulting path will be `/user/info/_modal/login`.

### Query Modal
Similar to global modals, query modals can be opened from any page without changing the page. The key differences between query modals and global modals are:

1. Query modals open and close with changing the query string.
2. Query modals cannot have child views.
3. Query modals cannot be accessed directly via URL; they must be opened using `openModal` or `open` from `setupModal`.

Query modals are commonly used for utility purposes, such as alerts and confirmation dialogs.

#### Setting Up a Query Modal
To set up a query modal, pass the routes to the `query` option in `createModalRoute`.

```ts
export const router = createModalRoute({
  routes: [
    // ...
  ],
  query: [
    {
      name: 'Alert',
      component: () => import('~/components/Alert.vue'),
    },
    {
      name: 'Confirm',
      component: () => import('~/components/Confirm.vue'),
    },
  ]
})
```

Then place `<ModalQueryView>` outside of `<RouterView>`, typically at the root of the component tree, such as in `<App>`.

```vue
<!-- App.vue -->
<template>
    <main>
      <RouterView />
    </main>
    <ModalQueryView />
</template>
```

The query modal route component functions similarly to the path modal route component. For example:

```vue
<!-- Confirm.vue -->
<script setup lang="ts">
const { modelValue, closeAndReturn } = useCurrentModal()

defineProps<{
  title?: string,
  message?: string
}>()
</script>

<template>
  <Modal v-model="modelValue" :title="title">
    <p>{{ message }}</p>
    <button @click="closeAndReturn(false)"> Cancel </button>
    <button @click="closeAndReturn(true)"> Confirm </button>
  </Modal>
</template>
```

That's it, you can now open the Confirm modal from anywhere.

```vue
<!-- /some/path/any -->
<script setup lang="ts">
const onSubmit = () => {
  const yes = await openModal('Confirm', {
    data: {
      title: "Notice",
      message: "Are you sure to submit the form ?"
    }
  })
  if (yes) {
    // do something ...
  }
}
</script>
```

### Child Views in Modal Route Component
One of the key benefits of modal routes is that we can leverage the full power of Vue Router's `router-view` inside the modal.

You can register a route as a child route of the modal route.

```ts
export const router = createModalRoute(
  {
    routes: [
      {
        name: "Index",
        path: '/',
        component: () => import("./pages/Index.vue"),
        children: [
          {
              name: 'User',
              path: 'user',
              component: () => import('./pages/user.vue'),
              meta: {
                modal: true
              },
              children: [
                {
                  name: "Info",
                  path: 'info',
                  component: () => import('./pages/user/info.vue'),
                },
                {
                  name: "Photos",
                  path: 'photos',
                  component: () => import('./pages/user/photos.vue'),
                },
              ]
            }
        ]
      }
     
    ]
  }
  
)
```

To render a child view within a modal route component, you can use `<ModalRouterView>`.

```vue
<script setup lang="ts">
import { ModalRouterView } from '@vmrh/core'

const { modelValue } = useCurrentModal()

</script>

<template>
  <Modal v-model="modelValue">
    <!-- ... -->

    <ModalRouterView />
  </Modal>
</template>
```

`<ModalRouterView>` can be used just like `<RouterView>`

```vue
<template>
  <Modal v-model="visible">
    <!-- ... -->

    <RouterLink :to="{ name: 'Info' }">
      Go to Info
    </RouterLink>
    <RouterLink :to="{ name: 'Photos' }">
      Go to Photos
    </RouterLink>
      
    <ModalRouterView>
      <template #default="{ Component }">
        <Transition name="fade" mode="out-in">
            <component :is="Component" />
        </Transition>
      </template>  
    </ModalRouterView>
  </Modal>
</template>
```

When you want to render a nested modal route, for example:

```ts
const routes = createModalRoute(
  {
    routes: [
      {
        name: "Index",
        path: '/',
        component: () => import("./pages/Index.vue"),
        children: [
          {
              name: 'User',
              path: 'user',
              component: () => import('./pages/user.vue'),
              meta: {
                modal: true
              },
              children: [
                {
                  name: "UserEdit",
                  path: 'edit',
                  component: () => import('./pages/user/edit.vue'),
                  meta: {
                    modal: true
                  }
                },
              ]
            }
        ]
      }
     
    ]
  }
)
```

Just like rendering any other modal route, use `<ModalRouterView>`, instead of `<RouterView>`.

```vue
<!-- ./pages/user.vue -->
<script setup lang="ts">
import { ModalRouterView } from '@vmrh/core'

const { modelValue } = useCurrentModal()

</script>
<template>
  <Modal v-model="modelValue">
    <!-- ... -->

    <ModalRouterView />
  </Modal>
</template>
```

### Modal Layout
The modal you've chosen might not be the easiest to set up...

If you have a lot of modals, even simple configurations can quickly become overwhelming.

```vue
<script setup lang="ts">
const { modelValue } = useCurrentModal()

</script>
<template>
  <Modal v-model="modelValue">
    <!-- ... -->
  </Modal>
</template>
```

To simplify this setup, you can use `layouts`.

Start by creating a modal layout component.

```ts
// ./src/modal/layout/default.vue

import { defineComponent, h, resolveComponent } from "vue";
import { useCurrentModal } from "@vmrh/core";
import Modal from "./path-to-my-modal"

export default defineComponent({
  setup(props, { slots }) {
    const { modelValue } = useCurrentModal()

    return () => h(Modal, {
      modelValue: modelValue.value,
      'onUpdate:modelValue': (value: boolean) => modelValue.value = value,
      ...props,
    }, slots)
  },
})
```

Then, register these layouts in `createModalRoute`, where the keys represent the layout names.

```ts
import { createModalRoute } from '@vmrh/core'
import { defineAsyncComponent } from 'vue'

export const router = createModalRoute({
  layout: {
    default: defineAsyncComponent(() => import('~/modal/layout/default')),
    other: defineAsyncComponent(() => import('~/modal/layout/other')),
    // default: LayoutDialog,
  },

  routes: [
    // ...
  ]
})
```

With this setup, whenever you want to use a modal, you can simply use `<ModalLayout>`. By default, it will use the component registered under `layout.default`.

```vue
<script setup lang="ts">
// ...
</script>
<template>
  <ModalLayout>
    <!-- ... -->
  </ModalLayout>
</template>
```

If you want to use a different modal layout, just pass a different value to the `layout` prop, and it will apply the corresponding modal.

```vue
<template>
  <ModalLayout layout="other">
    <!-- ... -->
  </ModalLayout>
</template>
```

## Opening Multiple Types of Modals at the Same Time
Modals in `vue-modal-route` are categorized into three types: `path`, `global`, and `query`.

These modals can be opened simultaneously. For example, a path modal might be active, and then a global modal is opened on top of it. Or both a global modal and a query modal are open, and a path modal is triggered afterward. In such cases, `vue-modal-route` will handle the modal layers according to the following rules:

### Priority order: `path > global > query`

1. When a higher-priority modal is opened, all lower-priority modals are automatically closed.
2. When a lower-priority modal is opened, the URL will be appended, preserving the higher-priority modal.
3. (Optional, depending on modal implementation) Lower-priority modals are typically visually stacked in front of higher-priority modals.

#### Case 1:
1. A global modal is opened: URL becomes `/user/_modal/login`

2. Then a query modal is opened: URL updates to `/user/_modal/login?m-confirm=`

3. A path modal is then opened at `/products/:id/edit`: the URL becomes `/products/:id/edit`, and both the global and query modals are closed.

#### Case 2:
1. A path modal is opened: URL is `/products/:id/edit`

2. A global modal is opened: URL becomes `/products/:id/edit/_modal/login`

3. Then a query modal is opened: URL becomes `/products/:id/edit/_modal/login?m-confirm=`

4. Another global modal is opened with path `/_modal/preference`: URL becomes ``/products/:id/edit/_modal/preference`. The previously opened login and query modals are closed.

## Default Behavior
By default, `vue-modal-route` behaves similarly to a traditional modal, with the added benefit of being able to close the modal using the browser’s back button or navigation history.

### Opening via Forward Navigation is Not Supported
While users can go back to close the modal, they cannot navigate forward (e.g., using the "Forward" button) to open it.

This is based on the assumption that users are more likely to exit a modal than to re-enter it through forward navigation. In cases where users do want to re-open a modal, they usually do so via buttons or links. Furthermore, implementing forward navigation would require keeping track of modal state and data, which increases complexity. Given these trade-offs, `vue-modal-route` does not support forward navigation to open a modal.

### Direct Access via URL is Disabled by Default
By default, modals cannot be accessed directly by URL. To enable direct access, you must explicitly set `meta.direct: true` in the route definition.

Allowing direct access can greatly increase complexity in certain scenarios—especially when API calls or validations are required before opening the modal.

For example, consider a modal that shows detailed form submission results. This modal should only appear after a successful form submission and validation. If this modal could be directly accessed by URL, it would be difficult to ensure the required form data exists, forcing additional logic to handle such cases. In many scenarios, there’s no meaningful reason to allow direct access to such modals.

For these reasons, direct URL access is disabled by default.

## License
MIT

