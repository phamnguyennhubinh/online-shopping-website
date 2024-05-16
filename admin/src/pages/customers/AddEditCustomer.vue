<template>
    <h3>Edit Users</h3>
    <a-form ref="formRef" class="ant-form-vertical" :model="formState" :rules="rules">
      <a-form-item ref="name" label="Product name" name="name">
        <a-input v-model:value="formState.name" />
      </a-form-item>
      <a-form-item ref="name" label="Address" name="address">
        <a-input v-model:value="formState.address" />
      </a-form-item>
      <a-form-item ref="name" label="Phone" name="phone">
        <a-input v-model:value="formState.phone" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="onSubmit">Update</a-button>
      </a-form-item>
    </a-form>
  </template>
  <script setup>
  import { reactive, ref } from 'vue';
  import { useCustomers } from '@/stores/customers';
  
  const props = defineProps({
    dataSource: {
      type: Object,
      default: {}
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  })
  
  const { updateCustomer } = useCustomers();
  const { dataSource, isEdit } = props
  const formRef = ref();
  const formState = reactive({
    name: dataSource.name ?? '',
    address: dataSource.address ?? '',
    phone: dataSource.phone ?? '',
  });

  const rules = {
    name: [
      {
        required: true,
        message: 'Please input name',
        trigger: 'change',
      },
      {
        min: 3,
        max: 100,
        message: 'Length should be 3 to 100',
        trigger: 'blur',
      },
    ],
    address: [
      {
        required: true,
        message: 'Please input address',
        trigger: 'change',
      },
    ],
    phone: [
      {
        required: true,
        message: 'Please input phone',
        trigger: 'change',
      }
    ],
  };

  const onSubmit = async (mode) => {
    try {
      await formRef.value.validate();
      const res = await updateCustomer(1, formState, () => {
        // todo
      })
    } catch (error) {
      console.log('error', error);
    }
  };
  </script>
<style lang="scss">

</style>