import { createApp } from 'vue'
import App from './App.vue'
import elementPlus from './element-plus'
import './style.css'
import { router, modalRoute } from './router'

const app = createApp(App)
app
  .use(router)
  .use(elementPlus)
  .use(modalRoute)
  .mount('#app')
