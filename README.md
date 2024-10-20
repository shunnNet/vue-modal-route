# vue-modal-route
`vue-modal-route` is a package that can help open/close modals with routes, manage its data and get its return value.

By leveraging `vue-router`, it opens or closes modals when navigating to or from specific paths in a web application. Additionally, it allows for the transmission of complex data beyond just route parameters.

This is not the same thing as `Next.js` modal route (twitter-style modal), but similar with different concern. If you are finding for package like `Next.js`, try [nuxt-page-plus](https://github.com/serkodev/nuxt-pages-plus) made by [SerKo](https://github.com/serkodev).

> [!WARNING] This package is still in development and is not yet ready for production use. But you can clone the repository and test it out for yourself.

- [vue-modal-route](#vue-modal-route)
  - [Features](#features)
  - [Demo](#demo)
  - [Documentation (In progress)](#documentation-in-progress)
  - [Development](#development)
  - [Intro](#intro)
    - [Motivation](#motivation)
    - [Current Status, Challenges, and Future Plans](#current-status-challenges-and-future-plans)
    - [Navigation Logic](#navigation-logic)
      - [Explanation](#explanation)
  - [License](#license)


## Features
- 🚀 Open/Close modal with route, access it by url.
- 🚀 Pass data to the modal and receive a return value from it.
- 🌴 Use full power of `router-view`, `navigation-guard` of `vue-router`.
- ⬅️ Ensure a consistent navigation experience between the website and the mobile app.

## Demo
You can visit the demo site to check the current working results.

Demo: https://vue-modal-route-demo.netlify.app

Not all modal can be directly access from URL. That is controlled by option. 

The modals allowed access by URL are: 
- https://vue-modal-route-demo.netlify.app/_modal/modal-hash-a
- https://vue-modal-route-demo.netlify.app/modal-a
- https://vue-modal-route-demo.netlify.app/prepare/modal-c

If you encounter any weird behaviour after few actions, try to open a new tab to reset the page. (because its use `SessionStorage`)

The code of demo can be found in the `src/pages` directory. If you want to learn more about how it work, you can refer to the [Development](#development) section below. 

It's welcome to open an issue if you found any bug or issue.

## Documentation (In progress)
In progress...


## Development
```bash
# Clone the repository
git clone git@github.com:shunnNet/vrm.git

# install
pnpm install

# run
pnpm dev
```

Open `http://localhost:5173` in your browser. You can find some links and buttons to test the package.

## Intro
### Motivation
The behavior for toggling the modal is not complicated, for example:

```vue
<script lang="ts">
const visible = ref(false)
const modalData = ref({
  id: null,
})
const open = (id: number) => {
  modalData.value.id = id
  visible.value = true
}
const close = () => {
  visible.value = false
  modalData.value.id = null
}
</script>
<template>
  <Modal
    v-model="visible"
    :id="modalData.id"
  />
</template>
```
This is a simple task.

However, in a project, it might be repeated many times, or even multiple times within a single page. For example, I’ve personally encountered a page where I had to toggle around 10 Modals, and that kind of repetition can be exhausting. UI libraries often include Modal components, but they don’t come with composables for toggling Modals. To ease the burden of managing modal toggling, I started creating a modal state management package, and [vue-use-modal-context](https://github.com/shunnNet/vue-use-modal-context) was my first attempt.

After releasing `vue-use-modal-context` for some time, I realized it wasn’t the best approach, so I started improving it and also wanted to try adding a modal-route feature (which I thought would be simple).

I initially saw this modal + route functionality in `Next.js`, which some refer to as a **"twitter-style modal."** Its feature is that when the modal is toggled, the URL also changes, making the modal behave like a page. It can be toggled via the back and forward buttons, and the modal content can be accessed directly via a URL. For websites like Twitter (now called X), this makes it more convenient to display posts and share them via URLs.

However, the implementation of this package did not reference Next.js, and the actual result differs slightly from the **"twitter-style modal."** but, the idea stuck in my mind.

What got me thinking about implementing this feature was the experience I often had while browsing mobile web pages on Android. After opening a modal, I would press the "prev" key to close the modal, only to unintentionally leave the page. This made me realize that the navigation experience in mobile apps differs from that provided by websites. In mobile apps, when a modal-like screen appears, pressing the "back" button usually closes the modal.

When developing mobile web pages, there's often a design that attempts to mimic the look and feel of a mobile app, with the design requiring full-screen modals and multi-step form within them. However, the navigation logic of browsers and mobile apps differs, and bridging this gap can be a hassle from an engineering perspective, and it’s often overlooked.

Additionally, there are some scenarios where modal routes make sense:

- Opening a Modal across pages: If the target page is opened with a specific query string, the modal will automatically open.
- Adding multi-step pagination in the Modal: This is now possible by integrating with router-view, but it’s a bit awkward.
- Automatically opening a Modal upon site entry: This is common for promotional events.

With a modal route feature, I believe the above issues would be better addressed.

Moreover, I think if we’re going to implement a modal route feature, it’s best to maintain a consistent UX. There shouldn’t be modals that can be closed by pressing "prev" and others that cannot. From a DX (Developer Experience) perspective, it’s also preferable that all modals share a consistent interface. Therefore, the goal of this package is, in addition to having the modal route functionality, to inherit the concept from `vue-use-modal-context`: have modal open/close and data-passing functionality, ensuring it can be used in any situation without being tied to any UI library.

### Current Status, Challenges, and Future Plans
At present, most of the core functionality of this package has been successfully implemented.

- Binding the modal's open/close state with the route
- Data transmission during modal toggling
- In the future, further integration with Nuxt or unplugin will continue. The API may still undergo changes, and more testing and optimization are required before reaching a stable version.

Additionally, the initial goal of "maintaining a consistent experience with mobile apps" is not yet fully realized. It seems this requires further research.

Challenges in "maintaining a consistent experience with mobile apps":

The first challenge is the need to introduce some complex mechanisms into the current structure, which will complicate the scenarios.
The second challenge is DX (Developer Experience). Although the modal route functionality is already in place, the current navigation logic is more closely aligned with the state of web apps, which becomes particularly apparent when opening modals across pages. When a modal can be toggled across pages and navigated through forward and backward actions, state persistence becomes a new technical burden. Therefore, this package adopts a progressive approach, with the default behavior being more web-centric, but with configurable settings to make the behavior closer to that of an app. It also considers the possibility of dynamically adjusting based on the situation to accommodate the needs of different devices.

These enhancements are planned to be gradually added in future versions.

### Navigation Logic
In Next.js, modal routes can be achieved through parallel route + intercepting route.

The implementation path and considerations of vue-modal-route differ, particularly focusing on navigation logic, which balances several factors: the developer's workload, the current state of the web, and the navigation logic of mobile apps. Therefore, its implementation might seem a bit unconventional. This package makes heavy use of the History API and the underlying APIs of vue-router. This could be the most complex and controversial aspect of this package. Let me illustrate this with two scenarios:

- Scenario 1: Nested Modals
  - When opening nested modals at once, if the corresponding URL path is `page-a/modal-1/modal-1-1`, and we open it from page-a:
    - **"twitter-style modal"**: The history is `page-a` -> `page-a/modal-1/modal-1-1`, so pressing "prev" or the close button (X) will return to `page-a`.
    - `vue-modal-route`: The history is `page-a` -> `page-a/modal-1` -> ``page-a/modal-1`/modal-1-1`, so pressing "prev" or the close button (X) will return to `page-a/modal-1`.

- Scenario 2: Cross-page Modals
  - When opening a modal across pages, if the original URL is `page-a/modal-1` and we open `page-b/modal-2`:
    - **"twitter-style modal"**: The history is page-a -> `page-a/modal-1` -> page-b/modal-2, so pressing "prev" or the close button (X) will return to `page-a/modal-1`.
    - `vue-modal-route`: The history is page-a -> page-b -> page-b/modal-2, so pressing "prev" or the close button (X) will return to page-b.

#### Explanation
I believe the **"twitter-style modal"** is more intuitive for users. For users, "going back" naturally means "returning to the previous screen," which aligns more with the inherent behavior of browsers. `vue-modal-route` ultimately aims to achieve this form, but from a developer's perspective, this would make state management more challenging.

The approach taken by `vue-modal-route` places more emphasis on the dependency between the modal and its parent page. For example, when you open a modal across pages, it assumes that after closing the modal, the user should remain on the page where the modal was located. This is the same as opening a modal from within its parent page: the modal is part of a sub-process within a page or its parent component, so after closing, it should return to the parent component and continue its flow. I believe this is more aligned with most current modal use cases and fits the habits of web developers today, even if it feels counterintuitive on mobile devices.

`vue-modal-route` plans to introduce a `directly open mode` in the future, allowing developers to switch between the two logics depending on their needs.

In terms of implementation, it heavily utilizes the underlying APIs of `vue-router` to manage background operations with `History`. After the navigation takes effect, it performs `back`, `push`, and `replace` actions on the history to "fill in" history records that match the logic described above. Additionally, it uses `session-storage` to store the route location to return to when closing the modal.

For example, when opening a modal across pages, if the original URL is `page-a/modal-1` and we open `page-b/modal-2`, the flow would be:

1. `back()`: `page-a/modal-1` -> `page-a`
2. `push()`: `page-a` -> `page-b`
3. `push()`: `page-b` -> `page-b/modal-2`

In any case, the previous step of a modal route will always be its parent route.

## License
MIT

