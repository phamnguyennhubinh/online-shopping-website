<template>
  <a-breadcrumb>
    <a-breadcrumb-item v-for="item in listBreadcrumb" :key="item.name">
      <router-link :to="item.link ? item.link : '#'" v-if="item.link">
        {{ item.name }}
      </router-link>
      <span v-else>{{ item.name }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  listBreadcrumb: {
    type: Array,
    default: () => []
  }
})
</script>
