<template>
    <div class="text-end mb-2">
      <a-button type="primary" @click="showModal">Add new Size</a-button>
    </div>
    <a-table :dataSource="listColor" :columns="columns">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <EditOutlined style="margin-right: 5px; cursor: pointer;" @click="showModal(event, record)" />
          <a-popconfirm 
            title="Are you sure delete this task?" 
            ok-text="Yes" 
            @confirm="confirmDelete(record.id)"
            cancel-text="No">
            <DeleteOutlined />
          </a-popconfirm>
        </template>
      </template>
    </a-table>
    
    <a-modal v-model:open="open" title="Add Color" @ok="handleOk">
      <a-form ref="formRef" layout="vertical" :model="formState">
        <a-row :gutter="10">
          <a-col :span="24">
            <a-form-item label="Name" name="value" :rules="[{ required: true, message: 'Please input name' }]">
              <a-input v-model:value="formState.value" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="Value" name="type">
              <a-input v-model:value="formState.type" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="Value" name="code">
              <a-input v-model:value="formState.code" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </template>
  
  <script setup>
  import {
    EditOutlined,
    DeleteOutlined
  } from '@ant-design/icons-vue'
  import { onMounted, ref } from 'vue';
  import { useSettings } from '@/stores/settings'
  
  const { getListSize, createColor, updateCode, deleteCode } = useSettings();
  const open = ref(false);
  const listColor = ref([])
  const formRef = ref()
  const currentColor = ref({});
  const formState = ref({
    type: 'SIZE',
    value: '',
    code: ''
  })
  
  const columns = [
    {
      title: 'No',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    { title: 'Action', key: 'operation' },
  ]
  
  const showModal = (e, data) => {
    if (data) {
      currentColor.value = (data);
      const current = {
        type: data.type,
        value: data?.value,
        code: data.code
      }
      formState.value = current;
    }
    open.value = true;
  };
  
  const handleOk = async () => {
    await formRef.value.validate();
    if (currentColor.value.id) {
      const {type, ...rest} = formState.value
      await updateColorById({
        id: currentColor.value.id,
        ...rest
      })
    } else {
      await createColor(formState.value);
    }
    await fetchColor();
    open.value = false;
    formRef.value.resetFields();
  };
  
  const fetchColor = async () => {
    const res = await getListSize();
    console.log(res);
    listColor.value = res;
  }
  
  const updateColorById = async (body) => {
    await updateCode(body);
    await fetchColor();
  }
  
  const confirmDelete = async (id) => {
    if (!id) return;
    await deleteCode(id);
    await fetchColor();
  }
  onMounted(async () => {
    await fetchColor();
  });
  </script>