<template>
  <div>
    <a-radio-group v-model:value="mode" :style="{ marginBottom: '8px' }">
    </a-radio-group>
    <a-tabs v-model:activeKey="activeKey" tab-position="left" :style="{ height: '400px' }" @tabScroll="callback">
      <a-tab-pane key="1" tab="Colors">
        <TableColor />
      </a-tab-pane>
      <a-tab-pane key="2" tab="Brand">
        <TableBrand />
      </a-tab-pane>
      <a-tab-pane key="3" tab="Size">
        <TableSize />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import TableColor from '@/components/TableColor.vue'
import TableBrand from '@/components/TableBrand.vue'
import TableSize from '@/components/TableSize.vue'

const mode = ref('top');
const activeKey = ref('1');

const callback = val => {
  console.log(val);
};
</script>