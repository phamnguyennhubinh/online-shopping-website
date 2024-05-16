<template>
  <div>
    <a-flex justify="space-between" align="center" class="mb-2">
      <h3>List Orders</h3>
      <router-link :to="`/product/add`">
        <a-button type="primary">Add New Product</a-button>
      </router-link>
    </a-flex>
    <a-flex gap="middle" class="mb-2">
      <a-input v-model:value="inputSearchName" @change="handleChangeInputSearch" placeholder="Search product name ..."
        style="width: 200px;" />
    </a-flex>
    <a-table :columns="columns" :data-source="filteredProductList" :scroll="{ x: '100%', y: 600 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <router-link :to="`/product/${record.key}`">
            <EyeOutlined class="mr-2 cursor-pointer" />
          </router-link>
          <a-popconfirm title="Are you sure delete this task?" ok-text="Yes" cancel-text="No">
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
import { ref, computed } from 'vue'
import {
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

const getRandomElementLimited = (array, maxLength) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  let selectedWord = array[randomIndex];

  if (selectedWord.length > maxLength) {
    selectedWord = selectedWord.substring(0, maxLength) + '...';
  }

  return selectedWord;
}

const LIST_DESCRIPTION_RANDOM = [
  "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Explicabo ad aut odit ipsum incidunt quisquam!",
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam blanditiis sit voluptates fugit, cupiditate officiis.",
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet ut, ea animi culpa exercitationem quibusdam.",
  "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas aut animi, earum sapiente suscipit quibusdam!",
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque asperiores repellat modi perspiciatis cum necessitatibus."
]

const mockupData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      key: i + 1,
      name: `Sản phẩm ${i + 1}`,
      price: (i + 1) + 10000,
      priceDiscount: (i + 1) + 9000,
      color: 'Tím',
      status: false,
      branch: 'branch 1',
      description: getRandomElementLimited(LIST_DESCRIPTION_RANDOM, 100),
    })
  }
  return data;
}

const data = mockupData();
const listProducts = ref(data);
const inputSearchName = ref('');

const filteredProductList = computed(() => {
  let filteredList = mockupData();
  if (inputSearchName.value) {
    const searchQuery = inputSearchName.value.toLowerCase()
    filteredList = filteredList.filter(task => task.name?.toLowerCase().includes(searchQuery))
  }
  // if (selectedStatus.value) {
  //   filteredList = filteredList.filter(task => task.status === selectedStatus.value)
  // }
  return filteredList
})

const handleChangeInputSearch = (event) => {
  inputSearchName.value = event.target.value
}

const columns = [
  { title: 'No', dataIndex: 'key', key: 'key' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Price', dataIndex: 'price', key: 'price', sorter: (a, b) => a.price - b.price, },
  {
    title: 'Price Discount',
    dataIndex: 'priceDiscount',
    key: 'priceDiscount',
    sorter: (a, b) => a.priceDiscount - b.priceDiscount,
  },
  {
    title: 'Color',
    dataIndex: 'color',
    key: 'color',
  },
  {
    title: 'Branch',
    dataIndex: 'branch',
    key: 'branch',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    width: '30%'
  },
  { title: 'Action', key: 'operation' },
];
</script>