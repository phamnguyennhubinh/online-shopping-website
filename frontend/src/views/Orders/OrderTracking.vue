<template>
  <div class="container">
    <h1 class="text-align-center">Trạng thái đơn hàng</h1>
    <div>
      <div v-for="item in orders" :key="item.id" class="mt-20">
        <a-descriptions title="Thông tin chi tiết đơn hàng" bordered>
          <a-descriptions-item label="Product">
            <div v-for="ite in item.products" :key="ite.productId">
              {{ ite.productName }}
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="Type Ship">
            {{ item.typeShip.type }} - {{ item.typeShip.price }}
          </a-descriptions-item>
          <a-descriptions-item label="Order time">{{
            dayjs(item.createdAt).format("DD-MM-YYYY")
          }}</a-descriptions-item>
          <a-descriptions-item label="Status" :span="3">
            <a-badge
              status="processing"
              :text="renderTextStatus(item.statusOrder)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="Total Order:"
            >{{item.totalPrice}}</a-descriptions-item
          >
        </a-descriptions>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useCounterStore } from "@/stores/index";
import { ref, onMounted } from "vue";
import dayjs from "dayjs";
const counterStore = useCounterStore();
const result = ref();
const orders = ref([]);
const renderTextStatus = (status) => {
  switch (status) {
    case "S3":
      return "Đang chờ giao hàng";
    case "S6":
      return "Đã giao";
    case "S7":
      return "Đã huỷ";
    default:
      return "Đang chờ xác nhận";
  }
};
onMounted(async () => {
  // const cusId = JSON.parse(localStorage.getItem("idCustomer"));
  result.value = await counterStore.getListAllOrder();
  for (let i = 0; i < result.value.length; i++) {
    if (result.value[i].addressUser.userId === 1) {
      orders.value.push(result.value[i]);
    }
  }
});
</script>

<style scoped>
.mt-20 {
  margin-top: 20px;
}
</style>
