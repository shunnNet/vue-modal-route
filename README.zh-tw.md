# vue-modal-route
[English](./README.md) | [繁體中文](./README.zh-tw.md)

`vue-modal-route` 是一個套件，可以讓 modal 開關時伴隨 url，同時可以傳遞資料給 modal，也能從 modal 取得回傳值。

透過利用 `vue-router`，它可以在導航到或從特定路徑的過程中開啟或關閉 Modal。此外，它還允許傳遞複雜的資料，而不僅僅是 route param。

這與 `Next.js` 的 modal route（twitter-style modal）並不相同，但有類似之處，且考量重點不同。如果你在尋找類似於 `Next.js` 的 Modal route 的套件，可以試試由 [SerKo](https://github.com/serkodev) 製作的 [nuxt-page-plus](https://github.com/serkodev/nuxt-pages-plus)

> [!WARNING] 這套件仍然在開發中，還不建議在 production 中使用，不過你可以 clone 下來嘗試

- [vue-modal-route](#vue-modal-route)
  - [Features](#features)
  - [Demo](#demo)
  - [文件 （準備中）](#文件-準備中)
  - [Development](#development)
    - [Usage (very basic)](#usage-very-basic)
      - [Declare modal route](#declare-modal-route)
      - [Prepare modal component](#prepare-modal-component)
      - [Open/Close Modal](#openclose-modal)
      - [Setup Modal](#setup-modal)
      - [Pending modal visibility](#pending-modal-visibility)
  - [介紹](#介紹)
    - [動機](#動機)
    - [現況、困難與將來](#現況困難與將來)
    - [導航邏輯](#導航邏輯)
      - [情境一：巢狀 Modal](#情境一巢狀-modal)
      - [情境二：跨頁 Modal](#情境二跨頁-modal)
    - [解說](#解說)
  - [License](#license)


## Features
- 🚀 Modal 開關時伴隨 url，並且可以直接網址列輸入 url 開啟
- 🚀 傳遞資料給 Modal，而且可以取得回傳值
- 🌴 讓 Modal 可以利用 `vue-router` 的 `router-view`, `navigation-guard`.
- ⬅️ 確保 網頁 與 mobile APP 的導航體驗一致
- 🪟 不綁定任何 Modal 套件，你可以選擇自己喜歡的 Modal Library

## Demo
你可以點選以下的網址查看現在的工作成果：

Demo: https://vue-modal-route-demo.netlify.app

並不是所有的 Modal 都可以被直接從 url 進入開啟，那是透過設定進行控制的：

目前允許直接進入並開啟的 modal route 有以下三個：
- https://vue-modal-route-demo.netlify.app/_modal/modal-hash-a
- https://vue-modal-route-demo.netlify.app/modal-a
- https://vue-modal-route-demo.netlify.app/prepare/modal-c

你會看到有一個 `Hash Modal`，他之前是使用 `#` 做所以這樣叫，現在已經不是了，但還沒有修正他的命名。他的定位是全域 Modal，像是 `LoginModal`。

若你越是嘗試後，遭遇到很奇怪的情況，你可以嘗試開啟新的分頁重新進入 (因為他使用 `SessionStorage`)

demo 的程式碼在 demo branch 的 `src` 中，若你希望了解更多，你可以參照 [Development](#Development)

## 文件 （準備中）
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

### Usage (very basic)

#### Declare modal route
```ts
import { createModalRouter } from '~/modal'

export const router = createModalRouter({
  routes: [
    {
      name: 'PageSingleModal',
      path: '/',
      component: () => import('./pages/index.vue'),
      children: [
        // Declare modal route
        {
          name: "ModalA", // required
          path: 'modal-a'
          component: () => import('path/to/modal.vue'),
          meta: {
            modal: true, // required for declare modal route
            direct: true // allow directly access from url
          }
        },
      ],
    },
  ]
})
```

#### Prepare modal component
雖然我使用 `element-plus` 作為 modal library，但你可以使用任何你喜歡的 modal library。

不管你使用哪一款，裝到 modal route 上的 component 需要實作以下介面

- `v-model`: 會接收 visible state，當 modal route 判斷 modal 應該被開啟時，會變成 true
- `event: "return"`: 當你在 modal 元件呼叫 `emit("return", data)`, modal 會關閉，並回傳 `returnValue`.

for example:

```vue
<script setup lang="ts">
const visible = defineModel({
  type: Boolean,
  default: false,
})
defineEmits(['return'])
defineProps({
  message: {
    type: String,
    default: '',
  },
})
</script>
<template>
  <ElDialog
    v-model="visible"
    title="Page Single Modal B"
  >
    {{ message }}

    <!-- You must use this as <RouterView> replacement if you need render child view **in modal route** -->
    <ModalRouterView />
  </ElDiable>
</template>
```

#### Open/Close Modal 
```vue
<!-- pages/index.vue -->
<script setup lang="ts">
import { useModalRoute, ModalPathView } from "~/modal"
import { onMounted } from "vue"

const { openModal, closeModal } = useModalRoute()

onMounted(async () => {
  const returnValue = await openModal(
    'ModalA', // open with modal route name
    {
      // data will be directly passed as props of modal 
      data: {
        message: "I am message"
      }
    }
  )
  console.log(returnValue) // returnValue from emit("return", "returnValue")
})

// closeModal("ModalA")
</script>
<template>
    <div>Page Index</div>

    <!-- You need render `<ModalPathView>` like `<RouterView>` -->
    <ModalPathView /> 
</template>
```

`openModal` / `closeModal` 可以在其他頁面呼叫，不一定要在 `ModalPathView` 所在的頁面

#### Setup Modal 
若你要更近一步傳遞 props, slots, 處理 `openModal` 傳過來的 data，你需要用 `setupModal`。 `setupModal` 必須在你要 setup 的 modal route 的直接 parent route 元件被呼叫。

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
import { setupModal, ModalPathView } from "~/modal"
import { onMounted } from "vue"

const {
  open,
  close,
  returnValue,
  isActive: isModalAActive,
} = setupModal("ModalA", {
  // props can be object or function return object, the object can be ref/computed/reactive ...
  props: (data) => {
    // You will get data from openModal
    return computed(() => {
      return {
        ...modalProps.value,
        ...(data?.message ? { message: data?.message } : {}),
      }
    })
  },
  // pass slots to modal 
  slots: {
    footer: () => (
      h('span', 'This Slot passed from useModal. Should override the slot passed from template')
    ),
  },
})
</script>
<template>
    <div>Page Index</div>

    <!-- Another way to pass slots -->
    <ModalPathView>
      <template #ModalA-footer>
        <span>{{ insertMessage }}</span>
      </template>
      <template #ModalA-header>
        <span> header slot inserted from parent </span>
      </template>
    </ModalPathView> 
</template>
```

#### Pending modal visibility
Check example in `src/components/SingleModalSectionC.vue`.

```ts
const { open, unlock } = setupModal('PagePrepareModalC', {
  manual: true, // manual: true for pending modal 
  props: modalProps,
})

onMounted(async () => {
  await fetchUserData() // you can fetch data from API which is needed by modal
  
  // after data prepared
  unlock() // to release modal
})
```

## 介紹

### 動機
開關彈窗的行為不複雜，比如：

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

這是一件簡單的事。

但是在一個專案中，可能會重複許多次，或者在一個頁面中重複很多次。比如，我自己曾經遇到一個頁面中要開關 10 個左右的 Modal，那種重複會讓人很累。UI Library 通常會有 Modal 元件，可是卻不帶有開關 Modal 的 composable。因此為了減輕開關的行為帶來的負擔，我開始製作彈窗狀態管理套件，`vue-use-modal-context` 是我的第一個嘗試。

發佈 `vue-use-modal-context` 一段時間後，我發現那並不是最好的形式，於是開始改良他，並且也想嘗試加入 `modal-route` 的功能（我以為那個很簡單）。

我最開始是在 `Next.js` 中看到這種 `modal` + `route` 的功能的，也有人稱 **"twitter-style modal"**。他的特性是：當 modal 開關時，url 會一起改變，modal 形同一個頁面，可以被上下一頁開關，並且可以直接透過 url 訪問 modal 的內容。對 twitter (現在叫：X) 這種網站來說，這讓他可以更方便呈現貼文，並透過 url 分享貼文。

雖說如此，這個套件的實現並沒有參考 `Next.js`，實際的結果也與 **"twitter-style modal"** 有微妙的不同。不過他們在我的腦海留下了一點念頭。

讓我開始想把這個功能實作出來的原因是，我在 Android 瀏覽手機版網頁的時候，不時會遇到「開啟 Modal 後，想按 prev 鍵關閉 Modal，卻意外地離開了頁面」的情形。
這讓我注意到，行動裝置 App 的導航體驗跟網頁提供的導航體驗並不一致。在 Mobile App 中，如果出現像是彈窗一樣的畫面，「上一步」通常會關閉彈窗。

在開發手機版網頁的時候，總是會有一種設計是企圖讓畫面與體驗與手機版 APP 類似，設計會嘗試要求全螢幕的 Modal，並在其中加入多步驟分頁的功能。但是瀏覽器跟行動裝置 APP 在導航邏輯上有差異，弭平這個差異對工程上來說是個麻煩點，而且經常不會關注到這部分。

除此之外，還有一些情境讓 modal route 的存在有意義：

- 跨頁開啟 Modal：在目標頁面開啟時，若有攜帶特定 query string 的話開啟 Modal。
- Modal 中加入多 steps 分頁：現在透過與 router-view 整合是可能的，但有些尷尬
- 一進入網站就開啟 Modal：常見於發佈活動的情況

若有 modal route 的功能的話，我想以上問題應該會更好處理吧。

另外，我認為如果要做 modal route 的功能，最好是能夠保持 UX 體驗一致，不會有的 Modal 可以按下 prev 關閉，有的不行。從 DX 的角度來看，也希望所有 Modal 都有一致的使用介面比較好。因此，這個套件的目標是，除了具有 modal route 的功能，繼承自 `vue-use-modal-context` 的概念，同時也會具有 modal 開、關以及傳遞資料的機能，確保他可以運用在任何情境，並且不綁定任何 UI Library。

### 現況、困難與將來
現在，這個套件已經成功實作出了大部分的功能。

- Modal 開關狀態與 route 的綁定
- 開關時的資料傳遞

將來會持續進行與 Nuxt 或是 unplugin 的整合。API 仍然有可能會調整，而且需要經過更多的測試與優化，因此還未到達穩定版。

此外，當初的目標：「與 APP 維持一致體驗」的功能還不完整。那似乎還需要一些研究。

「與 APP 維持一致體驗」的問題點：

- 第一個是需要在目前的結構上，再加入一些複雜的機構，他將使情境變得更複雜。
- 第二個問題點是 DX。雖然目前已經有 modal route 的功能，但實際上，目前導航邏輯的設計比較接近 Web APP 的現況，這點在跨頁面開啟時，尤其可以感受到。當 modal 可以跨頁面開關，並且可以透過前進、後退進入時，狀態的保存會變成新的技術負擔。因此，這個套件會以漸進式的概念，在預設狀態下更接近 Web，但是可以透過調整設定，讓其行為更接近 APP，並考慮可以根據情況被動態調整，以適應不同裝置的需求。

以上這些預計在未來的版本逐漸加入。

### 導航邏輯
`Next.js` 可以透過 `parallel route` + `intercepting route` 的方式實現 modal route。

`vue-modal-route` 的實現路徑與考量點不同，尤其注重在導航邏輯，他擺盪在幾個因素之間：開發者的負擔、網頁的現況、APP 的導航邏輯。因此他的實現方式可能有點奇怪：這個套件大量利用了 `History` API 與 `vue-router` 的底層 API。這說不定會是這個套件複雜且最大的爭議點。讓我先舉以下兩個情境說明：

#### 情境一：巢狀 Modal
當一口氣開啟巢狀 Modal，假如他對應的 URL path 是 `page-a/modal-1/modal-1-1`，當我們在 `page-a` 開啟他:
- **"twitter-style modal"** ：history 是 `page-a` -> `page-a/modal-1/modal-1-1`，因此 prev 或按下 X，都會回到 `page-a`
- `vue-modal-route`：history 是 `page-a` -> `page-a/modal-1` -> `page-a/modal-1/modal-1-1`，因此 prev 或按下 X，都會回到 `page-a/modal-1`。

#### 情境二：跨頁 Modal
當跨頁開啟 Modal，假如原本的 URL 是 `page-a/modal-1`，開啟 `page-b/modal-2`:
- **"twitter-style modal"** ：history 是 `page-a` -> `page-a/modal-1` -> `page-b/modal-2`，因此 prev 或按下 X，都會回到 `page-a/modal-1`
- `vue-modal-route`：history 會是 `page-a` -> `page-b` -> `page-b/modal-2`，因此 prev 或按下 X，都會回到 `page-b`

### 解說
我認為 **"twitter-style modal"** 其實更符合使用者的直覺。對使用者來說，「倒退」的確反應為「回到上一個畫面」，並且更符合瀏覽器的天然特性。`vue-modal-route` 最終也期望做出這種形式，但對開發者來說，這在狀態管理上將會比較困難， 

`vue-modal-route` 的做法更注重 Modal 與他所在位置的依賴關係。比方說，當你跨頁面開啟彈窗時，他假設關閉彈窗後，希望使用者留在 Modal 所在的頁面。這與使用者在 Modal 所在的頁面開啟 Modal 相同：Modal 是位於某個頁面或是其 parent 元件的子流程，因此關閉後，他應該回到 parent 元件，繼續 parent 的流程。我認為這更貼近目前 Modal 大部分的案例，並且貼合現在網頁開發者的使用慣例。即使他在行動裝置上是反直覺的。

`vue-modal-route` 預計將來開放 `directly open mode`，讓開發者可以根據需求切換在兩種邏輯之間。

在實現上，他大量使用 `vue-router` 底層的 API 實現 `History` 的背景操作，在導航生效之後，按照上述邏輯，對 `history` 進行 `back`, `push`, `replace` 以「填充」出符合上述邏輯的 history records，並且使用 `session-storage` 紀錄關閉時應該返回的路由位置。

以跨頁開啟舉例：跨頁開啟 Modal，假如原本的 URL 是 `page-a/modal-1`，開啟 `page-b/modal-2`。則：

1. `back()`: `page-a/modal-1` -> `page-a`
2. `push()`: `page-a` -> `page-b`
3. `push()`: `page-b` -> `page-b/modal-1`

無論如何，modal route 的上一步都會是他的 parent route。

## License
MIT