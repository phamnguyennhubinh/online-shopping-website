<template>
  <div>
    <Breadcrumb :listBreadcrumb="listBreadcrumb" class="mb-4"/>
    <div class="text-end">
      <a-button type="primary" style="margin-right: 10px" @click="isShowForm">{{ isEdit ? 'Cancel' : 'Edit' }}</a-button>
      <a-button type="primary" danger @click="handleDelete">Delete</a-button>
    </div>
    <template v-if="!isEdit">
      <a-descriptions title="Product Detail" :size="size">
      <a-descriptions-item label="Product">{{ product.name ?? '-' }}</a-descriptions-item>
      <a-descriptions-item label="Price">{{ Utils.formatVndCurrency(product.originalPrice ?? '-') }}</a-descriptions-item>
      <a-descriptions-item label="Price Discount">{{ Utils.formatVndCurrency(product.discountPrice ?? '-') }}</a-descriptions-item>
      <a-descriptions-item label="Status">On</a-descriptions-item>
      <a-descriptions-item label="Brand">{{ product.brandId ?? '-'}}</a-descriptions-item>
      <a-descriptions-item label="Color">{{ product.color ?? '-'}}</a-descriptions-item>
      <a-descriptions-item label="Description">{{ product.content ?? '-'}}</a-descriptions-item>
      </a-descriptions>
      <a-flex gap="middle">
        Images: 
        <a-image
            :width="100"
            class="inline-block"
            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          />
          <a-image
            :width="100"
            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          />
          <a-image
            :width="100"
            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          />
      </a-flex>
    </template>
    <AddEditProduct @updateForm="updateForm" :isEdit="isEdit" :dataSource="product" v-else />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AddEditProduct from '@/pages/products/AddEditProduct.vue'
import { useProducts } from '@/stores/products';
import Breadcrumb from '@/components/Breadcrumb.vue'
import Utils from '@/helpers/utils'
import { useRoute } from 'vue-router'
const { deleteProduct, getProductById } = useProducts();
const route = useRoute()
const id = route.params.id;
const isEdit = ref(false);
const product = ref({});
const listBreadcrumb = [
  {
    name: 'Home',
    link: '/home'
  },
  {
    name: 'Product Detail',
  }
]
// method
const handleDelete = () => {
  deleteProduct(id, '/products', async () => {
    await fetchProductById();
  })
}
const fetchProductById = async () => {
  const productData = await getProductById(id);
  product.value = productData[0];
};

const updateForm = async (value) => {
  if (value === 'updated') {
    await fetchProductById();
  }
  isEdit.value = false;
}

const isShowForm = async () => {
  isEdit.value = !isEdit.value
}

onMounted( async () => {
  await fetchProductById();
})
</script>
