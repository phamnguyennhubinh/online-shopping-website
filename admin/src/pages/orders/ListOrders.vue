<template>
  <div>
    <Breadcrumb :listBreadcrumb="listBreadcrumb" class="mb-4"/>
    <a-flex justify="space-between" align="center" class="mb-2">
      <h3>List Orders</h3>
    </a-flex>
    <!-- <a-flex gap="middle" class="mb-2">
      <a-input v-model:value="inputSearchName" @change="handleChangeInputSearch" placeholder="Search product name ..."
        style="width: 200px;" />
    </a-flex> -->
    <a-table :loading="!dataLoaded" :columns="columns" :data-source="filteredOrdersList"
      :scroll="{ x: '100%', y: 300 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <router-link :to="`/order/${record.id}`">
            <EyeOutlined class="mr-2 cursor-pointer" />
          </router-link>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ dayjs(record.createdAt).format('DD/MM/YYYY')}}
        </template>
        <template v-else-if="column.key === 'statusOrder'">
          <span v-if="record.statusOrder === 'S1'" class="bg-wn status-order ant-alert-message">Pending</span>
          <span v-if="record.statusOrder === 'S2'" class="bg-success status-order ant-alert-message">Done</span>
          <span v-if="record.statusOrder === 'S3'" class="bg-danger status-order ant-alert-message">Cancel</span>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  EyeOutlined
} from '@ant-design/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useOrders } from '@/stores/orders';
import dayjs from 'dayjs';

const { getAllOrders } = useOrders();

const listBreadcrumb = [
  {
    name: 'List Orders'
  }
]
const orders = ref([]);
const inputSearchName = ref('');
const dataLoaded = ref(false);

const handleChangeInputSearch = (event) => {
  inputSearchName.value = event.target.value
}

const columns = [
  { title: 'No', dataIndex: 'id', key: 'id' },
  { title: 'Price', dataIndex: 'totalPrice', key: 'totalPrice', sorter: (a, b) => a.price - b.price, },
  {
    title: 'CreatedAt',
    dataIndex: 'createdAt',
    key: 'createdAt'
  },
  {
    title: 'Status Order',
    dataIndex: 'statusOrder',
    key: 'statusOrder',
  },
  { title: 'Action', key: 'operation' },
];

const fetchOrders = async () => {
  dataLoaded.value = false;
  const productsData = await getAllOrders();
  dataLoaded.value = true;
  orders.value = productsData;
}

onMounted(async () => {
  await fetchOrders();
});

const filteredOrdersList = computed(() => {
  let filteredList = orders.value;
  if (inputSearchName.value) {
    const searchQuery = inputSearchName.value.toLowerCase()
    filteredList = filteredList.filter(item => item.name?.toLowerCase().includes(searchQuery))
  }
  return filteredList
})
</script>
<style>
.status-order {
  padding: 3px 15px;
  border-radius: 4px;
}
.bg-wn {
  background-color: #ffc107;
  color: white;
}
.bg-success {
  background-color: #1e7e34;
}
.bg-danger {
  background-color: #bd2130;
  color: white;
}
</style>