<template>
  <h3>Tổng quan</h3>
  <div class="wp">
    <div class="total">
      <span class="title">Total orders</span>
      <span>{{ totalOrders }}</span>
    </div>
    <!-- <div class="total">
      <span class="title">Orders Pending</span>
      <span>{{ totalOrdersPending }}</span>
    </div>
    <div class="total">
      <span class="title">Total orders delivered</span>
      <span>{{ totalOrdersDelivered }}</span>
    </div>
    <div class="total">
      <span class="title">Total orders canceled</span>
      <span>{{ totalOrdersCancel }}</span>
    </div> -->
    
  </div>
  <ChartBar />
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useOrders } from '@/stores/orders';
import ChartBar from '@/components/ChartBar.vue'

const { getAllOrders } = useOrders();
const totalOrders = ref(0);
const totalOrdersPending = ref(0);
const totalOrdersDelivered = ref(0);
const totalOrdersCancel = ref(0);
onMounted(async() => {
  const res = await getAllOrders();
  const s1 = res.filter(item => item.statusOrder === 'S4').length;
  const s2 = res.filter(item => item.statusOrder === 'S6').length;
  const s3 = res.filter(item => item.statusOrder === 'S7').length ;
  totalOrders.value = res.length;
  totalOrdersPending.value = s1;
  totalOrdersDelivered.value = s2;
  totalOrdersCancel.value = s3;
})
</script>
<style lang="scss" scoped>
.wp {
  display: flex;
  align-items: center;
}
.total {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80px;
  width: 200px;
  border-radius: 12px;
  background-image: url("../assets/dispatch-bg.png");
  background-position: center;
  margin-right: 25px;
  > .title {
    font-size: 18px;
    color: #1675fc;
    font-weight: 600;
  }
  span {
    color: #262626;
    font-weight: 600;
  }
}
</style>
