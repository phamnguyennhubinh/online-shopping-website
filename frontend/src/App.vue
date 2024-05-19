<template>
  <div id="app">
    <!-- <div v-if="counterStore.isLoading!=0" class="loader-overlay">
      <center><img src="@\assets\spin.gif"/></center>
    </div> -->
    <PrimaryPage v-if="!isAdminRoute" />
    <router-view v-else />
  </div>
</template>

<script setup>
import PrimaryPage from './views/PrimaryPage.vue';
import { useCounterStore } from "@/stores/index";
import { computed, onMounted} from 'vue';
const counterStore = useCounterStore();
const isAdminRoute = window.location.pathname.startsWith('/admin');
// const array = JSON.parse(localStorage.getItem("cart"));
counterStore.countC = computed(() => counterStore.listCarts.length);
onMounted(async ()=>{
  const customerId = JSON.parse(localStorage.getItem("idCustomer")) || null;
  if(customerId === null){
    counterStore.listCarts = [];
  }
  else {
    counterStore.listCarts = await counterStore.fetchListCustomerCart(customerId);
  }
  // console.log(customerId);
  // counterStore.listCarts = JSON.parse(localStorage.getItem("cart")) || [];
  
  // const idTemp = JSON.parse(localStorage.getItem("idCustomer")) || null;
  // if(idTemp !== null)
  // {
  //   await counterStore.fetchListCustomerCart(idTemp);
  //   counterStore.listCarts  = counterStore.getListCart;
  //   counterStore.countC = computed(() => counterStore.listCarts.length);
  // }
  // else
  // {
  //   counterStore.listCarts = [];
  //   counterStore.countC = computed(() => counterStore.listCarts.length);
  // }
})
// counterStore.listCarts =
</script>

<style>
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8); 
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>