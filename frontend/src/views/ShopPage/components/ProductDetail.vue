<template>
  <div id="main">
    <section class="container">
      <div class="grid">
        <a-breadcrumb class="bread_crumb">
          <a-breadcrumb-item>Home</a-breadcrumb-item>
          <a-breadcrumb-item
            ><a href="http://localhost:8080/shop">Shop</a></a-breadcrumb-item
          >
          <a-breadcrumb-item
            ><a href="http://localhost:8080/shop/detail"
              >Detail</a
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item
            ><a href="http://localhost:8080/shop/detail">{{
              counterStore.product.name
            }}</a></a-breadcrumb-item
          >
        </a-breadcrumb>
        <div class="row">
          <div class="col-md-5">
            <a-carousel
              arrows
              dots-class="slick-dots slick-thumb "
              class="margin-top-30"
            >
              <template #customPaging="props">
                <a>
                  <img :src="getImage(props.i)" />
                </a>
              </template>
              <div v-for="item in carouselPic" :key="item">
                <img :src="item" />
              </div>
            </a-carousel>
          </div>
          <div class="col-md-7">
            <h3 class="nameProduct can-le-respon-1">
              {{ counterStore.product.name }}
            </h3>
            <!-- price-discount-background -->
            <div class="can-le-trai">
              <div class="margin-top-30 text-align-center-res">
                <span class="price-discount margin-left-20">{{
                  counterStore.product.originalPrice
                }}</span>
                <span class="price">
                  &nbsp;{{
                    counterStore.product.discountPrice
                  }}&nbsp;&nbsp;</span
                >
                <span class="discount">{{ ((counterStore.product.originalPrice - counterStore.product.discountPrice)/counterStore.product.originalPrice)*100  }}% GIẢM</span>
                <div class="flex items-center"></div>
              </div>
            </div>
            <div class="flex flex-row gap-10">
              <div>
                <div>Số Lượng</div>
                <div>
                  <a-input-number
                    id="inputNumber"
                    v-model:value="value1"
                    :min="1"
                    :max="100"
                  />
                </div>
              </div>
              <div>
                <span>Kích cỡ</span>
                <div>
                  <a-select
                    v-model:value="sizeItem"
                    show-search
                    placeholder="Select a size"
                    style="width: 200px"
                    :options="listSizes"
                    :filter-option="filterOption"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @change="handleChange"
                  ></a-select>
                </div>
              </div>
              <div>
                <span>Màu sắc</span>
                <div>
                  <a-select
                    v-model:value="colorItem"
                    show-search
                    placeholder="Select a size"
                    style="width: 200px"
                    :options="listColors"
                    :filter-option="filterOptionColor"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @change="handleChangeCorlor"
                  ></a-select>
                </div>
              </div>
            </div>
            <div class="margin-left-20 can-le-trai center-res">
              <button type="button" class="button-add-cart" @click="addToCart">
                <i class="fa-solid fa-cart-plus"></i>&ensp;Thêm vào giỏ hàng
              </button>
              <!-- <router-link :to="{ name: 'PurchaseProducts' }"> -->
                <button type="button" class="button-buy-now" @click="buyNow">
                  Mua Ngay
                </button>
              <!-- </router-link> -->
              <!-- <button type="button" class="button-buy-now" @click="buyNow">Mua Ngay</button> -->
            </div>
          </div>
        </div>
      </div>

      <section class="margin-50-0">
        <h3>CHI TIẾT SẢN PHẨM</h3>
        <div>
          {{ counterStore.product.content }}
        </div>
      </section>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useCounterStore } from "@/stores";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";
import "vue-slick-carousel/dist/vue-slick-carousel.css";
import "vue-slick-carousel/dist/vue-slick-carousel-theme.css";
const counterStore = useCounterStore();
const value1 = ref(1);
const sanphams = ref([]);
const route = useRoute();
const router = useRoute();
const carouselPic = ref([]);
// const discountPercent = ref(0);
const listColors = ref([]);
const listSizes = ref([]);
const selectSize = ref(null);
const selectColor = ref(null);

const handleChange = (sizeItem) => {
  console.log(`selected ${sizeItem}`);
  selectSize.value = sizeItem;
};

const handleChangeCorlor = (colorItem) => {
  console.log(`selected ${colorItem}`);
  selectColor.value = colorItem;
};

const filterOption = (input, option) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const filterOptionColor = (input, option) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

onMounted(async () => {
  scrollToTop();
  const productId = route.params.id;
  await counterStore.fetchEachProduct(productId);
  sanphams.value = counterStore.product;
  const arr = counterStore.product?.images;
  const colors = counterStore.product.colors;
  const sizes = counterStore.product.sizes;
  for (let i = 0; i < arr.length; i++) {
    if(arr[i]) {
      const picture = arr[i].image;
    carouselPic.value.push(picture);
    }
  }
  for (let i = 0; i < colors.length; i++) {
    listColors.value.push({ value: colors[i].id, label: colors[i].value });
  }
  for (let i = 0; i < sizes.length; i++) {
    listSizes.value.push({ value: sizes[i].id, label: sizes[i].sizeId });
  }
});
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
const addToCart = async () => {
  try {
    if(selectSize.value === null)
    {
      return message.error("Vui lòng chọn size");
    } else if (selectColor.value === null)
    {
      return message.error("Vui lòng chọn màu áo");
    }
    const idCustom = JSON.parse(localStorage.getItem("idCustomer"));
    const data = {
      userId: idCustom,
      sizeId: selectSize.value,
      quantity: value1.value,
    };

    const status = await counterStore.addItemToCustomerCart(data);
    if (status === 200) {
      counterStore.listCarts = await counterStore.fetchListCustomerCart(idCustom)
      counterStore.countCart()
      // counterStore.countC = counterStore.listCarts.length
    } else {
      message.error("Thêm sản phẩm không thành công!");
    }
  } catch (error) {
    // message.error("Somethings wrong!! You should comeback later.");
    console.log(error);
  }
};
const buyNow = async () => {
  const productId = route.params.id;
  const idCustomer = JSON.parse(localStorage.getItem("idCustomer")) || '';
  if(idCustomer === '')
  {
    message.error("Vui lòng đăng nhập")
    return
  }
  if(selectSize.value === null)
    {
      return message.error("Vui lòng chọn size");
    } else if (selectColor.value === null)
    {
      return message.error("Vui lòng chọn màu áo");
    }
  await counterStore.buyNow(productId, selectSize.value, selectColor.value, value1);
  router.push({ name: "PurchaseProducts" });
  counterStore.totalBillOrder;
};
const getImage = (i) => {
  return carouselPic.value[i];
};
</script>

<style lang="scss" scoped>
//end-carousel
//...
.col-md-5 {
  text-align: left;
}
.gap-10 {
  gap: 10px;
}
// @import "@/assets/styles/grid.css";
$color-main: orangered;
.margin-bottom-20 {
  margin-bottom: 20px;
}
.padding-bottom-20 {
  padding-bottom: 20px;
}
._margin {
  position: relative;
  margin: 20px 10px;
}
.icon-button {
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
}
.button-arrow-1 {
  position: absolute;
  width: 1.2rem;
  height: 2.5rem;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  color: #fff;
  background-color: rgba(0, 0, 0, 0.2);
  border: none;
}
.button-arrow-2 {
  position: absolute;
  width: 1.2rem;
  height: 2.5rem;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  color: #fff;
  background-color: rgba(0, 0, 0, 0.2);
  border: none;
}
.can-le-trai {
  text-align: left;
}
.margin-50-0 {
  margin: 50px 0;
}
.margin-0-20 {
  margin: 0 20px;
}
.width-option {
  width: 120px;
}
.margin-right-20 {
  margin-right: 20px;
}
.padding-0-20 {
  padding: 0 20px;
}
.color-main {
  color: $color-main;
}
.margin-top-20 {
  margin-top: 20px;
}
.margin-top-30 {
  margin-top: 30px;
}
.margin-left-20 {
  margin-left: 20px;
}
.padding-left-20 {
  padding-left: 20px;
}
.padding-left-20-icon {
  @extend .padding-left-20;
  color: $color-main;
}
.discount {
  background-color: orangered;
  color: #fff;
}
.price {
  color: orangered;
  font-size: 40px;
}
.price-discount {
  text-decoration: line-through;
}
.price-discount-background {
  background-color: #fafafa;
}
.like {
  background-color: orangered;
  color: #fff;
  font-size: 13px;
}
.bread_crumb {
  margin-bottom: 10px;
  margin-left: 20px;
  margin-top: 5px;
}
.row {
  .col-md-5 {
    text-align: center;
    justify-content: center;
    vertical-align: middle;
  }
}
// HIDDEN
.label-detail {
  padding-left: 30px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: rgba(0, 0, 0, 0.4);
  font-size: 0.875rem;
  box-sizing: border-box;
  width: 8.75rem;
  padding-right: 0.75rem;
}
.shadow {
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.03);
}
.button-add-cart {
  background-color: #fef6f5;
  border: 1px solid #ee4d2d;
  padding: 10px 40px;
  font-size: 16px;
  color: #ee4d2d;
  margin-top: 20px;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.03);
  &:hover {
    background-color: #fff;
    border: 1px solid #ee4d2d;
  }
}
.button-buy-now {
  background-color: #ee4d2d;
  color: #fff;
  border: 1px solid #ee4d2d;
  padding: 10px 50px;
  font-size: 16px;
  margin-top: 20px;
  margin-left: 20px;
  &:hover {
    background: linear-gradient(#ee4d2d, #ff7337);
    border: 1px linear-gradient(#ee4d2d, #ff7337);
  }
}
a {
  text-decoration: none;
  color: black;
}
.items-center {
  align-items: center;
}
.bonus {
  width: 100%;
  box-sizing: border-box;
  padding: 1.25rem 2.1875rem 0 1.25rem;
}
.col-left {
  width: 450px;
  padding: 15px;
  flex-shrink: 0;
}
.col-right {
  flex: 1 0 auto;
  /* width: 0; */
}
.flex-auto {
  flex: 1 1 auto;
}
.picMain {
  padding-top: 30px;
}
.nameProduct {
  text-align: left;
  /* margin-right: 180px; */
}
// .container {
//   margin: 0 45px;
// }
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.border {
  border: 1px solid;
}
.flex {
  display: flex;
}
.picdetail {
  width: 100%;
  position: relative;
  /* padding-bottom: 100%; */
}
.manypic {
  display: inline-block;
  box-sizing: border-box;
}
// .smallPics {
//   position: relative;
//   align-items: center;
//   margin-top: 3%;
//   display: flex;
//   justify-content: space-between;
// }
.pic {
  width: 100%;
  margin: 0 10px;
  cursor: pointer;
}
:deep(.slick-dots) {
  position: relative;
  height: auto;
  margin-top: 30px;
}
:deep(.slick-slide img) {
  border: 5px solid #fff;
  display: block;
  margin: auto;
  max-width: 80%;
}
:deep(.slick-arrow) {
  display: none !important;
}
:deep(.slick-thumb) {
  bottom: 0px;
}
:deep(.slick-thumb li) {
  width: 60px;
  height: 45px;
}
:deep(.slick-thumb li img) {
  width: 100%;
  height: 100%;
  display: block;
}
:deep .slick-thumb li.slick-active img {
  filter: grayscale(0%);
}
@media screen and (max-width: 576px) {
  .items-center {
    display: none;
  }
  .button-add-cart {
    padding: 10px 10px;
    // display: inline;
  }
  .button-buy-now {
    padding: 10px 10px;
    // display: inline;
  }
  .container {
    margin: 0;
    padding: 0;
  }
  .card {
    // margin-top: 0px;
    padding: 0;
  }
  .changeRes {
    display: none;
  }
  .can-le-respon {
    text-align: center;
  }
  .can-le-respon-1 {
    text-align: center;
    margin-top: 20px;
  }
  .text-align-center-res {
    text-align: center;
  }
  .margin-left-20 {
    margin-left: 10px;
  }
  .center-res {
    text-align: center;
  }
}
@media screen and (min-width: 768px) and (max-width: 992px) {
  .button-add-cart {
    padding: 10px 20px;
    // display: inline;
  }
  .button-buy-now {
    padding: 10px 20px;
    // display: inline;
  }
  .center-res {
    text-align: center;
  }
}
</style>
