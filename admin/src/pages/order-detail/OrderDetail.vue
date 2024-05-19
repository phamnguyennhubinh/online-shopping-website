<template>
  <div>
    <Breadcrumb :listBreadcrumb="listBreadcrumb" class="mb-4" />
    <div class="text-end">
      <a-select class="text-start" v-model:value="value" value="S1" placeholder="Select status" style="width: 200px" :options="options"
        @change="handleChange"></a-select>
    </div>
    <a-descriptions title="Customer Detail">
      <a-descriptions-item label="Note">{{ order?.note }}</a-descriptions-item>
      <a-descriptions-item label="Address">{{ order?.addressUser?.shipAddress }}</a-descriptions-item>
      <a-descriptions-item label="Email">{{ order?.addressUser?.shipEmail }}</a-descriptions-item>
      <a-descriptions-item label="Phone Number">{{ order?.addressUser?.shipPhoneNumber }}</a-descriptions-item>
      <a-descriptions-item label="Type Ship">{{ order?.typeShip }}</a-descriptions-item>
    </a-descriptions>
    <br>
    <div class="ant-descriptions-title mb-2">Sản phẩm:</div>
    <div v-for="product in currentOrder?.products">
      <a-descriptions>
        <a-descriptions-item label="Produc Name">{{ product?.productName }}</a-descriptions-item>
        <a-descriptions-item label="Price">{{ Utils.formatVndCurrency(product?.priceProduct) }}</a-descriptions-item>
        <a-descriptions-item label="Quantity">{{ product?.quantity }}</a-descriptions-item>
      </a-descriptions>
    </div>
    <div>
      Total Price: <strong>{{ Utils.formatVndCurrency(order?.totalPrice ?? 0) }}</strong>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useOrders } from '@/stores/orders';
import Utils from '@/helpers/utils'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useRoute } from 'vue-router'

const { getOrdersById, updateOrder, getAllOrders } = useOrders();
const route = useRoute()
const id = route.params.id;
const order = ref({});
const listBreadcrumb = [
  {
    name: 'Order',
    link: '/orders'
  },
  {
    name: 'Order Detail',
  }
]
const options = ref([
  {
    value: 'S1',
    label: 'Đang chờ xác nhận',
  },
  {
    value: 'S2',
    label: 'Đã giao hàng',
  },
  {
    value: 'S3',
    label: 'Huỷ đơn hàng',
  }
]);
const handleChange = async (value) => {
  await updateOrder({
    id: id,
    statusId: value
  })
  await fetchOrdersById()
};
const value = ref("S1");
const currentOrder = ref({});
const fetchOrdersById = async () => {
  const res = await getOrdersById(id);
  const test = await getAllOrders();
  const result = test.find(item => item.id == id)
  currentOrder.value = result
  order.value = res;
  value.value = res.statusId
}
onMounted(async () => {
  await fetchOrdersById();
});
</script>