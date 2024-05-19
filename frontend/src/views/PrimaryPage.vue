<template>
  <div>
    <HeaderWeb />
      <router-view />
    <FooterWeb
      :class="currentRoute === 'AdminShop' ? 'isAdmin' : 'noneAdmin'"
    />
    <!-- <a-float-button-group
      trigger="click"
      type="primary"
      :style="{ right: '24px' }"
    >
      <template #icon>
        <CustomerServiceOutlined />
      </template>
      <a-float-button />
      <a-float-button>
        <template #icon>
          <CommentOutlined />
        </template>
      </a-float-button>
    </a-float-button-group> -->
    <a-float-button-group
      trigger="hover"
      type="primary"
      :style="{ right: '24px' }"
    >
      <template #icon>
        <CustomerServiceOutlined />
      </template>
      <a-float-button />
      <a-float-button>
        <template #icon>
          <CommentOutlined />
        </template>
      </a-float-button>
    </a-float-button-group>
  </div>
</template>

<script setup>
import HeaderWeb from "@/components/HeaderWeb.vue";
import FooterWeb from "@/components/FooterWeb.vue";
import { useCounterStore } from "@/stores";
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import {
  CustomerServiceOutlined,
  CommentOutlined,
} from "@ant-design/icons-vue";
const counterStore = useCounterStore();
let currentRoute = ""; // Khởi tạo biến currentRoute để lưu đường dẫn hiện tại

// Sử dụng useRoute để lấy route hiện tại
const route = useRoute();

// Watch route thay đổi
// Sử dụng watchEffect để theo dõi thay đổi của route và lưu vào biến currentRoute
watchEffect(() => {
  currentRoute = route.name;
});
counterStore.countC = computed(() => (counterStore.listCarts || []).length);
// const currentRoute = null;
// counterStore.countC = computed(() => counterStore.listCarts.length);
// onMounted(
//   ()=>{
//     counterStore.countC = JSON.parse(localStorage.getItem("cart")).length;
//   }
// )
</script>

<style scoped>
.isAdmin {
  display: none;
}
</style>
