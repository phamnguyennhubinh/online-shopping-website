<template>
  <div>
    <section id="product">
      <h1 class="text-align-center">LIST CARTS</h1>
      <div class="grid container border">
        <div class="col-md-4 col-sm-4 position-relative">
          <span class="text-align-left-absolute">
            <!-- <a-checkbox
         v-model:checked="checked"
         @change="handleCheckAllChange"
       >
       &ensp;
       </a-checkbox> -->
            <input
              type="checkbox"
              id="myCheck"
              @change="selectAll"
              @click="handleCheckAllChange()"
              v-model="checkboxCart"
            />
          </span>

          <span class="left-absolute">Sản phẩm</span>
        </div>
        <div class="col-md-2 col-sm-2">Đơn giá</div>
        <div class="col-md-2 col-sm-2">Số lượng</div>
        <div class="col-md-2 col-sm-2">Số tiền</div>
        <div class="col-md-2 col-sm-2">Thao tác</div>
      </div>
      <div
        class="grid container card"
        style="margin-top: 40px"
        v-for="cart in counterStore.listCarts"
        :key="cart.id"
      >
        <div class="row">
          <CartItem
            :pic="cart.image"
            :color="cart.color"
            :sizeId="cart.sizeId"
            :name="cart.name"
            :price="cart.discountPrice"
            :id="cart.id"
            :quantity="cart.quantity"
            :status="cart.status"
            @updateStatus="updateStatus"
            @delete="deleteCart"
            @addOrder="addOrder"
            v-model:checkboxCart="checkboxCart"
          />
        </div>
      </div>
      <div class="container">
        <!-- <div class="row margin-top-30">
       <div class="col-md-10 right"><span class="font-color">Total</span></div>
       <div class="col-md-2">
         <span class="backgr">${{ totalCart }}</span>
       </div>
     </div> -->
        <!-- <div class="text-align-center">
          <span class="font-color">Total: </span
          ><span class="backgr">{{ totalCart }} VND</span>
        </div> -->
      </div>
    </section>
    <section id="totalBill" :class="{ hidden: hidden }">
      <div class="row border2 background">
        <!-- <div class="col">
        <input
          type="checkbox"
          id="checkFixed"
          v-model="checkboxOrder"
          @change="selectAll"
          @click="handleCheckAllChange(2)"
        />
        <span>&nbsp;&nbsp;Chọn tất cả</span>
      </div> -->
        <div class="col">
          <div>Tổng thanh toán</div>
          <div>({{ computedValue.countPro }} sản phẩm)</div>
        </div>
        <div class="col">
          <span class="color-price">{{ computedValue.billEach }} VND</span>
          <!-- totalCart computedValue.billEach totalBillBottom -->
        </div>
        <div class="col" id="order">
          <router-link :to="{ name: 'PurchaseProducts' }">
            <button :hidden="hidden" class="btn btn-add">Mua Hàng</button>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useCounterStore } from "@/stores/index";
import CartItem from "@/components/CartItem.vue";
import { ref } from "vue";
import { onMounted, computed, watch, onUnmounted } from "vue";
const counterStore = useCounterStore();
const checkboxCart = ref(false);
const checkboxOrder = ref(false);
const howMuchTrue = ref(0);
const count = ref(0);
const hasFalse = ref();
const hidden = ref(true);
const update = ref([]);

// Hàm watcher để theo dõi thay đổi của checkboxCart
watch(
  () => checkboxCart.value,
  (newValue) => {
    // Thực hiện các hành động khi giá trị của checkboxCart thay đổi
    if (newValue) {
      localStorage.setItem("statusCheck", JSON.stringify(2));
      console.log("CheckboxCart được chọn.");
      // Thực hiện các hành động khi checkboxCart được chọn
      for (let i = 0; i < counterStore.listCarts.length; i++) {
        counterStore.listCarts[i].status = true;
      }
      hidden.value = false;
      // localStorage.setItem("addCart", JSON.stringify(arrId.value));
    } else {
      hidden.value = false;
      console.log("CheckboxCart không được chọn.");
      const number = JSON.parse(localStorage.getItem("statusCheck"));
      if (number === 2) {
        for (let i = 0; i < counterStore.listCarts.length; i++) {
          counterStore.listCarts[i].status = false;
        }
        hidden.value = true;
        console.log(counterStore.listCarts);
      }

      hidden.value = true;
    }
  }
);
watch(
  () => counterStore.listCarts,
  (newValue, oldValue) => {
    // Đây là nơi xử lý khi có sự thay đổi trong counterStore.listCarts
    update.value = oldValue;
    // Gọi hàm hoặc thực hiện các hành động khác cần thiết khi có sự thay đổi
    // Ví dụ: computedValue.refresh(); // Cập nhật giá trị computed
  }
);

onMounted(async () => {
  // Lấy danh sách cart từ localStorage
  const idTemp = JSON.parse(localStorage.getItem("idCustomer"));
  await counterStore.fetchListCustomerCart(idTemp);
  const storedCarts = counterStore.getListCart || [];
  localStorage.setItem("cart", JSON.stringify(storedCarts));
  // Thêm biến status: true vào mỗi object
  if (storedCarts) {
    counterStore.listCarts = storedCarts.map((cart) => ({
      ...cart,
      status: false,
    }));
  }
  localStorage.removeItem("addCart");
  counterStore.totalBill();
  localStorage.setItem("statusCheck", JSON.stringify(2));
})

const updateStatus = (newStatus, productId) => {
  localStorage.setItem("statusCheck", JSON.stringify(2));
  const storedCarts = counterStore.getListCart;
  if (newStatus === true) {
    hidden.value = false;
  } else {
    hidden.value = true;
  }

  // cập nhật biến status: true or false vào mỗi object
  if (storedCarts) {
    const findIndex = counterStore.listCarts.findIndex(
      (item) => item.id === productId
    );
    if (findIndex !== -1) {
      counterStore.listCarts[findIndex].status = newStatus;
    } else {
      console.error();
    }
  }
  howMuchTrue.value = 0;
  count.value = 0;
  for (let i = 0; i < counterStore.listCarts.length; i++) {
    count.value++;
    if (counterStore.listCarts[i].status === true) {
      howMuchTrue.value++;
    } else {
      hasFalse.value = counterStore.listCarts[i].id;
    }
  }
  if (count.value === howMuchTrue.value) {
    checkboxCart.value = true;
  } else if (count.value - howMuchTrue.value === 1) {
    checkboxCart.value = false;
    localStorage.setItem("statusCheck", JSON.stringify(3));
    hidden.value = false;
  } else if (howMuchTrue.value !== 0) {
    hidden.value = false;
  }
  console.log(counterStore.listCarts);
};

const selectAll = () => {
  if (checkboxCart.value === true) {
    checkboxOrder.value = true;
    counterStore.checkedbox = true;
  } else {
    checkboxOrder.value = false;
    counterStore.checkedbox = false;
  }
};

const computedValue = computed(() => {
  let totalBill = 0;
  let count = 0;
  if (counterStore.listCarts) {
    for (let i = 0; i < counterStore.listCarts.length; i++) {
      const cart = counterStore.listCarts[i];
      if (cart.status === true) {
        count++;
        totalBill += counterStore.totalEachProduct(cart.id);
      }
    }
  }
  return { billEach: totalBill, countPro: count };
});

const deleteCart = async (cartId) => {
  const index = counterStore.listCarts.findIndex((item) => item.id === cartId)
  counterStore.listCarts.splice(index, 1);
  console.log(counterStore.listCarts)
  await counterStore.removeCart(cartId);
};

// const totalCart = computed(() => counterStore.totalBill());

const handleCheckAllChange = () => {
  selectAll();
  var checkBox = document.getElementById("myCheck");
  if (checkBox.checked === true) {
    counterStore.check = true;
  } else {
    counterStore.check = false;
  }
};
onUnmounted(() => {
  // window.removeEventListener('scroll', handleScroll);
});
</script>

<style scopped>
@import "./css/list-cart.css";
</style>
