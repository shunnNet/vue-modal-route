import { createApp } from 'vue'
import App from './App.vue'
import elementPlus from './element-plus'
import './style.css'
import { router, modalRouteContext } from './router'
import { modalRouteContextKey } from './modal/modalRouteContext'

const app = createApp(App)
app
  .use(router)
  .use(elementPlus)
  .provide(modalRouteContextKey, modalRouteContext)
  .mount('#app')
