<template>
  <div>
    <Breadcrumb :listBreadcrumb="listBreadcrumb" class="mb-4"/>
    <a-flex justify="space-between" align="center" class="mb-2">
      <h3>List Product</h3>
      <router-link :to="`/product/add`">
        <a-button type="primary">Add New Product</a-button>
      </router-link>
    </a-flex>
    <a-flex gap="middle" class="mb-2">
      <a-input v-model:value="inputSearchName" @change="handleChangeInputSearch" placeholder="Search product name ..."
        style="width: 200px;" />
      <a-select placeholder="Select a person" v-model:value="color" show-search :options="options"
        style="width: 100px;" />
    </a-flex>
    <a-table :loading="!dataLoaded" :columns="columns" :data-source="filteredProductList"
      :scroll="{ x: '100%', y: 300 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <router-link :to="`/product/${record.id}`">
            <EyeOutlined class="mr-2 cursor-pointer" />
          </router-link>
          <a-popconfirm title="Are you sure delete this task?" @confirm="confirm(record.id)" @cancel="cancel"
            ok-text="Yes" cancel-text="No">
            <DeleteOutlined class="cursor-pointer ml-2" />
          </a-popconfirm>
        </template>
        <template v-else-if="column.key === 'status'">
          <span>
            {{ record.status ? "On" : "Off" }}
          </span>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useProducts } from '@/stores/products';

const { deleteProduct, getAllProducts } = useProducts();

const options = ref([
  {
    value: 'Tím',
    label: 'Tím',
  },
  {
    value: 'Đỏ',
    label: 'Đỏ',
  }
]);
const listBreadcrumb = [
  {
    name: 'List Product'
  }
]
const products = ref([]);
const inputSearchName = ref('');
const color = ref('');
const dataLoaded = ref(false);

const handleChangeInputSearch = (event) => {
  inputSearchName.value = event.target.value
}

const columns = [
  { title: 'No', dataIndex: 'id', key: 'id' },
  { title: 'Name', dataIndex: 'name', key: 'name', width: '20%' },
  { title: 'Price', dataIndex: 'originalPrice', key: 'originalPrice', sorter: (a, b) => a.originalPrice - b.originalPrice, },
  {
    title: 'Price Discount',
    dataIndex: 'discountPrice',
    key: 'discountPrice',
    sorter: (a, b) => a.discountPrice - b.discountPrice,
  },
  {
    title: 'Brand',
    dataIndex: 'brandId',
    key: 'brandId',
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
  },
  { title: 'Action', key: 'operation' },
];

const fetchProduct = async () => {
  dataLoaded.value = false;
  const productsData = await getAllProducts();
  dataLoaded.value = true;
  products.value = productsData;
}

const confirm = (id) => {
  dataLoaded.value = false;
  deleteProduct(id, false, async () => {
    await fetchProduct();
  })
};

const cancel = (e) => {
  console.log(e);
};

onMounted(async () => {
  await fetchProduct();
});

const filteredProductList = computed(() => {
  let filteredList = products.value;
  if (inputSearchName.value) {
    const searchQuery = inputSearchName.value.toLowerCase()
    filteredList = filteredList.filter(item => item.name?.toLowerCase().includes(searchQuery))
  }
  // if (color.value) {
  //   filteredList = filteredList.filter(task => task.color === color.value)
  // }
  return filteredList
})
</script>