<template>
  <div>
    <div class="text-end">
      <a-button type="primary" style="margin-right: 10px" @click="isShowForm">{{ isEdit ? 'Cancel' : 'Edit'
        }}</a-button>
      <a-button type="primary" danger @click="handleDelete">Delete</a-button>
    </div>
    <template v-if="!isEdit">
      <a-descriptions title="Customer Detail" :size="size">
        <a-descriptions-item label="Product">{{ dataSource.name }}</a-descriptions-item>
        <a-descriptions-item label="Branch">{{ dataSource.address }}</a-descriptions-item>
        <a-descriptions-item label="Color">{{ dataSource.phone }}</a-descriptions-item>
      </a-descriptions>
    </template>
    <AddEditCustomer :isEdit="isEdit" :dataSource="dataSource" v-else />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AddEditCustomer from '@/pages/customers/AddEditCustomer.vue'
import { useCustomers } from '@/stores/customers';

const { deleteCustomer, getCustomerById, customer } = useCustomers();

const dataSource = {
  id: 1,
  name: "product",
  address: 'branch',
  phone: 123123123,
}

const isEdit = ref(false);
const currentCustomer = ref({});

onMounted(async () => {
  await getCustomerById(1);
  if (customer) {
    currentCustomer.value = customer;
  }
});

const handleDelete = () => {
  deleteCustomer(dataSource.id, '/', () => {
    // call success
  })
}

const isShowForm = () => {
  isEdit.value = !isEdit.value
}
</script>