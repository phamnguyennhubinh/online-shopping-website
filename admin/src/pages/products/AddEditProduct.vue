<template>
  <h3>{{isEdit ? 'Edit product' : 'Add new product'}}</h3>
  <a-form ref="formRef" layout="vertical" :model="formState" :rules="rules">
    <a-row :gutter="10">
      <a-col :span="12">
        <a-form-item label="Product name" name="name">
          <a-input v-model:value="formState.name" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="Branch" name="branch">
          <a-select v-model:value="formState.brand" placeholder="please select your zone">
            <a-select-option v-for="brand in listBrand" :value="brand.code">{{ brand.value }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="Color" name="color">
          <a-select v-model:value="formState.color" mode="multiple" placeholder="please select your zone">
            <a-select-option :value="color.code" v-for="color in listColor">{{ color.value }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="Size" name="size">
          <a-select v-model:value="formState.size" mode="multiple" placeholder="please select your zone">
            <a-select-option :value="size.code" v-for="size in listSize">{{ size.value }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item ref="price" label="Price" name="price">
          <a-input v-model:value="formState.originalPrice" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item ref="priceDiscount" label="Price Discount" name="priceDiscount">
          <a-input v-model:value="formState.discountPrice" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item ref="quantity" label="Quantity" name="quantity">
          <a-input v-model:value="formState.quantity" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="Status" name="statusId">
          <a-radio-group v-model:value="formState.statusId">
            <a-radio value="S2">Off</a-radio>
            <a-radio value="S1">On</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item label="Description" name="content">
          <a-textarea v-model:value="formState.content"/>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="Upload" name="fileListProduct">
          <a-upload list-type="picture-card" v-model:file-list="formState.fileListProduct" >
            <div>
              <PlusOutlined />
              <div style="margin-top: 8px">Upload</div>
            </div>
          </a-upload>
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item>
          <a-button type="primary" @click="onSubmit(isEdit ? 'update' : 'create')">{{ isEdit ? 'Update' : 'Create' }}</a-button>
          <a-button style="margin-left: 10px" @click="resetForm" v-if="!isEdit">Reset</a-button>
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
</template>
<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useProducts } from '@/stores/products';
import { useSettings } from '@/stores/settings';
import router from '@/router';
import { useRoute } from 'vue-router'
import Utils from '@/helpers/utils'

const emit = defineEmits({
  updateForm: 'updated'
})

const route = useRoute()

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

const { updateProduct, createProduct } = useProducts();
const { getListBrand, getListColor, getListSize } = useSettings();
const { dataSource, isEdit } = props
const formRef = ref();
const listColor = ref([]);
const listBrand = ref([]);
const listSize = ref([]);

const fetchSettings = async () => {
  const resBrand = await getListBrand();
  listBrand.value = resBrand
  const resColor = await getListColor();
  listColor.value = resColor
  const resSize = await getListSize();
  listSize.value = resSize
  console.log(listSize.value)
}

const id = route.params.id;
const formState = reactive({
  id: id,
  name: dataSource?.name ?? '',
  brand: dataSource?.brand?.code ?? '',
  statusId: dataSource?.statusId ?? '',
  content: dataSource?.content ?? '',
  color: dataSource?.colors?.map(item => item.code) ?? [],
  categoryId: dataSource?.category?.code,
  statusId: dataSource?.statusId,
  originalPrice: dataSource?.originalPrice ?? '',
  discountPrice: dataSource?.discountPrice ?? '',
  size: dataSource?.sizes?.map(item => item.sizeId) ?? [],
  fileListProduct: Utils.addBase64Files(dataSource.images),
  quantity: 10,
});
const rules = {
  name: [
    {
      required: true,
      message: 'Please input name',
      trigger: 'change',
    },
  ],
  branch: [
    {
      required: false,
      message: 'Please select Activity zone',
      trigger: 'change',
    },
  ],
  color: [
    {
      required: false,
      message: 'Please select color',
      trigger: 'change',
    },
  ],
  statusId: [
    {
      required: false,
      message: 'Please select activity status',
      trigger: 'change',
    },
  ],
  fileListProduct: [
    {
      required: false,
      message: 'Please select a file',
    },
  ],
  desc: [
    {
      required: true,
      message: 'Please input description',
      trigger: 'blur',
    },
  ],
};

const onSubmit = async (mode) => {
  try {
    await formRef.value.validate();
    let res;
    const formData = new FormData();
    formState.brandId = formState.brand;
    formState.productId = dataSource.id;
    for (const key in formState) {
      if (key !== 'fileListProduct') {
        formData.append(key, formState[key]);
      }
    }
    formState.fileListProduct?.forEach(item => {
      formData.append('images', item.originFileObj);
    });
    if (mode === 'update') {
      res = await updateProduct(formData, () => {
        emit('updateForm', 'updated');
      })
    } else {
      res = await createProduct(formData, () => {
        router.push('/products');
      })
    }
  } catch (error) {
    console.log('error', error);
  }
};

const resetForm = () => {
  formRef.value.resetFields();
};

onMounted( async () => {
  await fetchSettings()
})
</script>