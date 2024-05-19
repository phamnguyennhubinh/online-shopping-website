import { createApp } from "vue";
import App from "./App.vue";
import "./assets/styles/styles.css";
import "font-awesome/css/font-awesome.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap";
import VueStickyElement from "vue-sticky"
import router from "./router";
import VueRouter from "vue-router";
import { createWebHistory } from "vue-router";
import Antd from 'ant-design-vue';
import { Pagination } from "ant-design-vue";
import 'vue-slick-carousel/dist/vue-slick-carousel.css';
import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css';
// import Pagination from "vue3-pagination";
import store from "./stores";
import { createPinia } from "pinia";
import axios from "axios";
window.axios = axios;
// const isAdminRoute = window.location.pathname.startsWith('/admin');
createApp(App)
  .use(createPinia())
  .use(router)
  .use(store)
  .use(Antd)
  .use(Pagination)
  .use(createWebHistory)
  .use(VueRouter)
  .use(VueStickyElement)
  .mount("#app");
