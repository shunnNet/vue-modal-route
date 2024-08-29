import { createApp } from 'vue'
import App from './App.vue'
import elementPlus from './element-plus'
import './style.css'
import { router } from './router'
import { routes as modalRoutes } from './modal/modalHashRouter'
import { modalRouteContextKey, createModalRouteContext } from './modal/modalRouteContext'

const app = createApp(App)
app
  .use(router)
  .use(elementPlus)

const modalRouteContext = createModalRouteContext(router)
app.provide(modalRouteContextKey, modalRouteContext)
  .provide('modalRoutes', modalRoutes)
  .mount('#app')
