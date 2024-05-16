
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import './assets/main.css'
import Vue3ColorPicker from "vue3-colorpicker";
import "vue3-colorpicker/style.css";
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import Antd from 'ant-design-vue';
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(Antd)
app.use(router)
app.use(Vue3ColorPicker)
app.mount('#app')
