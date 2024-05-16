<template>
  <a-layout style="min-height: 100vh">
    <SiderDefault :collapsed="collapsed" :collapse="collapse" />
    <a-layout>
      <HeaderDefault />
      <a-layout-content style="margin: 0 16px">
        <div style="margin: 16px 0"></div>
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <router-view />
        </div>
      </a-layout-content>
      <FooterDefault />
    </a-layout>
  </a-layout>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import FooterDefault from './FooterDefault.vue'
import HeaderDefault from './HeaderDefault.vue'
import SiderDefault from './SiderDefault.vue'

const collapsed = ref(false)

const collapse = () => {
  collapsed.value = !collapsed.value;
}
</script>