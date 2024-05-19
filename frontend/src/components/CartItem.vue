<template>
  <div
    class="col-lg-2 col-md-2 col-sm-4 align-items-center justify-content-center position-relative"
  >
    <span class="text-align-left-abso">
      <!-- <a-checkbox v-model:checked="checked" @change="ifCheckAllTrue"
        >&nbsp;&nbsp;</a-checkbox
      > -->
      <input
        type="checkbox"
        :id="id"
        :checked="status"
        @change="updateStatus"
      />
    </span>
    <img class="picture-box" :src="pic" />
  </div>
  <div
    class="col-lg-2 col-md-2 col-sm-2 align-items-center justify-content-center"
  >
    <div class="font-weight">{{ name }} - {{ color }}</div>
  </div>
  <div
    class="col-lg-2 col-md-2 col-sm-2 align-items-center justify-content-center color-price"
  >
    {{ price }}
  </div>
  <div
    class="col-lg-2 col-md-2 col-sm-4 align-items-center justify-content-center"
  >
    <div>
      <button @click="countMinus" class="quantity">
        <i class="fa-solid fa-minus"></i>
      </button>
      <input
        class="quantity inputQuantity"
        type="text"
        id="inputBuy"
        :value="quantity"
        @input="updateQuantity"
        @keydown="handleKeyDown"
      />
      <button
        @click="counterStore.increaseQuantity(id, quantity)"
        class="quantity"
      >
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  </div>
  <div
    class="col-lg-2 col-md-2 col-sm-2 align-items-center justify-content-center"
  >
    <div class="color-price">{{ totalEach }}</div>
  </div>
  <div
    class="col-lg-2 col-md-2 col-sm-2 align-items-center justify-content-center"
  >
    <button @click="deleteCart" class="btn">Xóa</button>
  </div>
</template>

<script>
import { useCounterStore } from "@/stores";
import { ref } from "vue";
export default {
  props: {
    id: Number,
    pic: String,
    name: String,
    price: Number,
    quantity: Number,
    status: Boolean,
    checkboxCart: Boolean,
    color: String,
    sizeId: Number
  },
  data() {
    const counterStore = useCounterStore();
    const count = 1;
    let checked = ref(this.status);
    return {
      counterStore,
      count,
      checked,
    };
  },
  methods: {
    handleKeyDown(event) {
      // Kiểm tra xem phím được nhấn có phải là số hay không
      if (!/^\d$|^Backspace$|^Delete$/.test(event.key)) {
        // Nếu không phải số, ngăn chặn sự kiện
        event.preventDefault();
      }
    },
    updateQuantity(event) {
      // Được gọi mỗi khi giá trị của trường input thay đổi
      // this.quantity = event.target.value;
      const num = Number(event.target.value);
      if (num === 0) {
        this.deleteCart();
      } else {
        this.deleteCart();
        this.counterStore.inputQuantity(this.id, num, this.sizeId);
      }

      // Xử lý logic của bạn tại đây
    },
    getValue() {
      const ex = document.getElementById("inputBuy");
      console.log(ex.value);
    },
    deleteCart() {
      this.$emit("delete", this.$props.id);
    },
    countPlus() {
      this.$emit("plus", this.$props.count);
    },
    countMinus() {
      if (this.quantity === 1) {
        this.deleteCart();
      } else {
        this.deleteCart();
        this.counterStore.decreaseQuantity(this.id, this.quantity, this.sizeId);
      }
    },
    addOrder() {
      this.$emit("addOrder", this.$props.id, this.checked);
    },
    updateStatus(event) {
      this.$emit("updateStatus", event.target.checked, this.id);
    },
    computedProductId() {
      return this.id;
    },
  },
  computed: {
    totalEach() {
      const totalEachPro = this.counterStore.totalEachProduct(this.id);
      return totalEachPro;
    },
  },
  watch: {
    status: function (newValue) {
      this.checked = newValue;
    },
  },
};
</script>

<style lang="scss" scopped>
.position-relative {
  position: relative;
}
.text-align-left-abso {
  position: absolute;
  left: 10px;
}
.display-none {
  display: none;
}
.display-block {
  display: block;
}
.font-weight {
  font-weight: bold;
}
.color-price {
  color: orangered;
  font-weight: bold;
}
.btn {
  background-color: orangered;
  border: none;
  padding: 10px 20px;
  color: #fff;
  &:hover {
    background-color: rgb(246, 132, 88);
    color: #fff;
  }
}
.align-items-center {
  align-items: center;
}
.justify-content-center {
  justify-content: center;
}
.picture-box {
  width: 60%;
  //   height: 100%;
  padding: 10px;
}
.quantity {
  outline: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.1s cubic-bezier(0.4, 0, 0.6, 1);
  border: 1px solid rgba(0, 0, 0, 0.09);
  border-radius: 2px;
  background: transparent;
  color: black;
  width: 25px;
  height: 30px;
  display: inline;
}
.inputQuantity {
  width: 25px;
  height: 30px;
  border-left: 0;
  border-right: 0;
  font-size: 16px;
  font-weight: 400;
  box-sizing: border-box;
  text-align: center;
  cursor: text;
  border-radius: 0;
  display: inline;
  margin: 7px 0;
  padding-bottom: 4px;
}

.grid .row {
  display: flex;
  justify-content: center;
  vertical-align: middle;
  text-align: center;
}
@media screen and (max-width: 1023px) {
  .picture-box {
    width: 100%;
  }
}
@media screen and (max-width: 768px) {
  .picture-box {
    width: 50%;
  }
}
@media screen and (min-width: 375px) and (max-width: 811px) {
  .picture-box {
    width: 50%;
  }
}
@media screen and (max-width: 800px) {
  // .grid .row .col-md-2 {
  //   width: calc(50% - var(--bs-gutter-x));
  // }
  .grid .row {
    flex-direction: row;
    align-items: flex-start;
  }

  .grid .row .col-md-2 {
    width: 50%;
  }

  .grid .row .col-md-2:first-child {
    // flex-direction: column;
    flex-basis: 100%; /* Ensure the first column takes up 100% width */
  }
}
</style>
