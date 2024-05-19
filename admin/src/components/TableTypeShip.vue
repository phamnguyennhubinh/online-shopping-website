<template>
  <div class="text-end mb-2">
    <a-button type="primary" @click="showModal">Add type ship</a-button>
  </div>
  <a-table :dataSource="listTypeShip" :columns="columns" :scroll="{ x: '100%', y: 300 }">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <EditOutlined style="margin-right: 5px; cursor: pointer;" @click="showModal(event, record)" />
        <a-popconfirm title="Are you sure delete this task?" ok-text="Yes" @confirm="confirmDelete(record.id)"
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
          <a-form-item label="Name" name="price" :rules="[{ required: true, message: 'Please input price' }]">
            <a-input v-model:value="formState.price" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="Value" name="type" :rules="[{ required: true, message: 'Please input name' }]">
            <a-input v-model:value="formState.type" />
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
import { AxiosInstance } from '@/helpers/request';
import { message } from 'ant-design-vue';

const { createColor, updateCode, deleteCode } = useSettings();
const open = ref(false);
const listTypeShip = ref([])
const formRef = ref()
const currentTypeship = ref({});
const formState = ref({
  type: '',
  price: '',
})
const getTypeShip = async () => {
  try {
    const res = await AxiosInstance.get('/type-ship');
    return res?.data?.result ?? []
  } catch (error) {
    console.log(error);
  }
}

const updateTypeShip = async (body) => {
  try {
    await AxiosInstance.put('/type-ship/update', body);
    message.success('Update successful !');
  } catch (error) {
    console.log(error);
  }
}

const createTypeShip = async (body) => {
  try {
    await AxiosInstance.post('/type-ship/create', body);
    message.success('Create successful !');
  } catch (error) {
    console.log(error);
  }
}

const deleteTypeShip = async (id) => {
  try {
    await AxiosInstance.delete('/type-ship/delete', {
      data: {
        id
      }
    });
    message.success('Delete successful!');
  } catch (error) {
    console.log(error);
  }
}

const columns = [
  {
    title: 'No',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  { title: 'Action', key: 'operation' },
]

const showModal = (e, data) => {
  if (data) {
    currentTypeship.value = (data);
    const current = {
      type: data?.type,
      price: data.price
    }
    formState.value = current;
  }
  open.value = true;
};

const handleOk = async () => {
  await formRef.value.validate();
  if (currentTypeship.value.id) {
    const { type, ...rest } = formState.value
    await updateColorById({
      id: currentTypeship.value.id,
      ...rest
    })
  } else {
    await createTypeShip(formState.value);
  }
  await fetchTypeShip();
  open.value = false;
  formRef.value.resetFields();
};

const fetchTypeShip = async () => {
  const res = await getTypeShip();
  listTypeShip.value = res;
}

const updateColorById = async (body) => {
  console.log(body)
  await updateTypeShip(body);
  await fetchTypeShip();
}

const confirmDelete = async (id) => {
  if (!id) return;
  const body = {
    id: 6
  }
  console.log(body)
  await deleteTypeShip(id);
  await fetchTypeShip();
}
onMounted(async () => {
  
  const res = await fetchTypeShip();
  console.log(res)
});
</script>