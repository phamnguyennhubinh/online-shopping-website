<template>
  <a-layout-sider v-model:collapsed="collapsed" collapsible @collapse="collapse">
    <div class="logo">
      <img src="../../assets/logo.svg" :width="collapsed ? '40' : '80'" alt="Logo">
    </div>
    <a-menu theme="dark" mode="inline">
      <a-menu-item v-for="menu in LIST_MENU" :key="menu.key">
        <router-link :to="menu.path" exact>
          <component :is="menu.icon" />
          <span>{{ menu.name }}</span>
        </router-link>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import {
  PieChartOutlined,
  DesktopOutlined
} from '@ant-design/icons-vue';
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  collapse: Function,
})
const { collapsed, collapse } = props
const LIST_MENU = [
  {
    key: "1",
    path: "/home",
    name: "Tổng quan",
    icon: PieChartOutlined
  },
  {
    key: "2",
    path: "/products",
    name: "Sản Phẩm",
    icon: DesktopOutlined
  },
  {
    key: "3",
    path: "/orders",
    name: "Đơn Hàng",
    icon: DesktopOutlined
  },
  {
    key: "4",
    path: "/customers",
    name: "Khách Hàng",
    icon: DesktopOutlined
  },
  {
    key: "5",
    path: "/settings",
    name: "Cài Đặt",
    icon: DesktopOutlined
  }
]
</script>
<style lang="scss">
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}
</style>