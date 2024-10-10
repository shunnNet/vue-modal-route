import { createApp } from 'vue'
import App from './App.vue'
import elementPlus from './element-plus'
import { router, modalRoute } from './router'
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

const app = createApp(App)
app
  .use(router)
  .use(elementPlus)
  .use(modalRoute)
  .mount('#app')
