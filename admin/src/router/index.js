import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterPage from '@/pages/account/RegisterPage.vue'
import LoginPage from '@/pages/account/LoginPage.vue'
import LayoutAccount from '@/pages/account/LayoutAccount.vue'
import ListProducts from '@/pages/products/ListProducts.vue'
import ListOrders from '@/pages/orders/ListOrders.vue'
import ListCustomers from '@/pages/customers/ListCustomers.vue'
import ProductDetail from '@/pages/product-detail/ProductDetail.vue'
import OrderDetail from '@/pages/order-detail/OrderDetail.vue'
import CustomerDetail from '@/pages/customer-detail/CustomerDetail.vue'
import AddEditProduct from '@/pages/products/AddEditProduct.vue'
import ContainerComponent from '@/layouts/default/ContainerComponent.vue'
import DefaultLayout from '@/layouts/default/DefaultLayout.vue'
import Settings from '@/pages/settings/Settings.vue'
import { useAuthStore } from '@/stores/auth';

const routerAccounts = [
  {
    path: '/account',
    component: LayoutAccount,
    children: [
      { path: '', redirect: 'login' },
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => DefaultLayout,
      children: [
        { path: '/', redirect: '/home' },
        {
          path: 'home',
          name: 'home',
          component: HomeView
        },
        {
          path: 'products',
          name: 'products',
          component: ListProducts
        },
        {
          path: 'product/:id',
          name: 'ProductDetail',
          component: ProductDetail
        },
        {
          path: 'product/add',
          name: 'AddViewProduct',
          component: AddEditProduct
        },
        {
          path: 'orders',
          name: 'order',
          component: ListOrders
        },
        {
          path: 'order/:id',
          name: 'orderDetail',
          component: OrderDetail
        },
        {
          path: 'customers',
          name: 'customers',
          component: ListCustomers
        },
        {
          path: 'customer/:id',
          name: 'customerDetail',
          component: CustomerDetail
        },
        {
          path: 'settings',
          name: 'settings',
          component: Settings
        },
      ]
    },
    ...routerAccounts,
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach((to, from, next) => {
  const publicPages = ['/account/login', '/account/register'];
  const authRequired = !publicPages.includes(to.path);
  const newAccessToken = localStorage.getItem('access_token') ?? null;
  if (authRequired && !newAccessToken) {
    next('/account/login');
  } else if (newAccessToken && publicPages.includes(to.path)) {
    next('/');
  } else {
    next();
  }
});


export default router
