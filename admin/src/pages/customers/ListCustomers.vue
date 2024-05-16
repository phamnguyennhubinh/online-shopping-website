<template>
    <div>
        <a-flex justify="space-between" align="center" class="mb-2">
            <h3>List Customers</h3>
        </a-flex>
        <a-flex gap="middle" class="mb-2">
          <a-input v-model:value="inputSearchName" @change="handleChangeInputSearch" placeholder="Search user ..."
            style="width: 200px;" />
        </a-flex>
        <a-table :columns="columns" :data-source="filteredCsutomerList" :scroll="{ x: '100%', y: 300 }">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'operation'">
                    <router-link :to="`/customer/${record.key}`">
                      <EyeOutlined class="mr-2 cursor-pointer" />
                    </router-link>
                    <a-popconfirm title="Are you sure delete this task?" 
                                  @confirm="confirm"
                                  @cancel="cancel" 
                                  ok-text="Yes" 
                                  cancel-text="No">
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
import { useCustomers } from '@/stores/customers';

const { deleteCustomer, getAllCustomers } = useCustomers();

const mockupData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      key: i + 1,
      name: `Sản phẩm ${i + 1}`,
      address: 'Ho Chi Minh City',
      phone: '1234567890',
    })
  }
  return data;
}

const data = mockupData();
const listCustomers = ref(data);
const inputSearchName = ref('');

const filteredCsutomerList = computed(() => {
  let filteredList = mockupData();
  if (inputSearchName.value) {
    const searchQuery = inputSearchName.value.toLowerCase()
    filteredList = filteredList.filter(task => task.name?.toLowerCase().includes(searchQuery))
  }
  return filteredList
})

const handleChangeInputSearch = (event) => {
  inputSearchName.value = event.target.value
}

const columns = [
  { title: 'No', dataIndex: 'key', key: 'key' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Address', dataIndex: 'address', key: 'address' },
  { title: 'Phone Number', dataIndex: 'phone', key: 'phone' },
  { title: 'Action', key: 'operation' },
];

const confirm = (e) => {
  console.log(e);
  deleteCustomer(1, false, async () => {
    console.log('success')
    setTimeout(async() => {
      await getAllCustomers();
    }, 2000)
  })
};

const cancel = (e) => {
  console.log(e);
};

</script>