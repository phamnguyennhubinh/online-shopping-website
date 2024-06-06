<!-- import { VALUE_SPLIT } from 'ant-design-vue/es/vc-cascader/utils/commonUtil'; -->
<template>
  <section class="container">
    <div class="">
      <div class="backgr-img"></div>
      <div class="font-color">
        <i class="fa-solid fa-location-dot" style="color: orangered"></i
        >&ensp;Địa chỉ nhận hàng
      </div>
      <div>
        <div class="margin-left">
          <span :hidden="!hiddenInfo"
            ><b>&ensp;</b> &ensp;<br class="displayForRes" />&ensp;&ensp;
          </span>
          <span :hidden="hiddenInfo"
            ><b>{{ name }}&ensp;{{ phone }}</b> &ensp;<br
              class="displayForRes"
            />{{ arraySelect }}&ensp;&ensp;
          </span>
          <a-button
            type="primary"
            @click="showDrawer"
            class="button-add-address"
          >
            <template #icon><PlusOutlined /></template>
            <i class="fa-solid fa-plus" style="color: #fff">&ensp;</i>&ensp;
            {{ status }}
          </a-button>
        </div>

        <a-drawer
          title="Add delivery address"
          :width="820"
          :open="open"
          :body-style="{ paddingBottom: '80px' }"
          :footer-style="{ textAlign: 'right' }"
          @close="onClose"
        >
          <a-space class="flex-container">
            <a-select
              ref="select"
              v-model:value="valueOne"
              :options="optionsOne"
              @focus="focus"
              @change="handleChange"
              @select="handSelect"
              class="flex-item"
            ></a-select>
            <!-- <a-button @click="handleAdd">Add</a-button> -->
            <a-button @click="handleUpdate">Update</a-button>
            <a-button @click="handleDelete">Delete</a-button>
            <a-button @click="handleClear">Clear</a-button>
          </a-space>
          <!-- <a-button-group>
            <button>Add</button>
            <button>Update</button>
            <button>Delete</button>
          </a-button-group> -->
          <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item
                  label="Name"
                  name="name"
                  :rules="[
                    { required: true, message: 'Please input your fullname!' },
                    {
                      pattern: /^[A-Za-zÀ-ỹ\s]*[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ\s]*$/,
                      message:
                        'Please enter a valid name with only letters and spaces',
                      trigger: ['blur', 'change'],
                    },
                  ]"
                >
                  <a-input
                    v-model:value="form.name"
                    v-model="message"
                    placeholder="Please enter your name"
                    pattern="[A-Za-z]+"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="Phone number"
                  name="phone"
                  :rules="[
                    {
                      required: true,
                      message: 'Please input your phone number!',
                    },
                    {
                      pattern: /^(0[2-9][0-9]{8}|[2-9][0-9]{8})$/,
                      message: 'Please enter a valid phone number',
                      trigger: ['blur', 'change'],
                    },
                  ]"
                >
                  <a-input
                    v-model:value="form.phone"
                    placeholder="Please enter your phone number"
                    maxlength="10"
                    pattern="/^(0[39]\d{8}|[39]\d{8})$/"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="Email:"
                  name="email"
                  :rules="[
                    { required: true, message: 'Please input your email!' },
                    {
                      type: 'email',
                      message: 'Please enter a valid email address',
                      trigger: ['blur', 'change'],
                    },
                  ]"
                >
                  <a-input v-model:value="form.email" class="border-none" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="Address" name="specificAddress">
                  <a-input
                    v-model:value="form.specificAddress"
                    placeholder="Please enter your specific address"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <!-- <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="Description" name="description">
                  <a-textarea
                    v-model:value="form.description"
                    :rows="4"
                    placeholder="please enter url description"
                  />
                </a-form-item>
              </a-col>
            </a-row> -->
          </a-form>
          <template #extra>
            <a-space>
              <a-button @click="onClose">Cancel</a-button>
              <a-button @click="selectDelivery">Select</a-button>
              <a-button type="primary" @click="handleSubmit">Add</a-button>
            </a-space>
          </template>
        </a-drawer>
      </div>
    </div>
    <div>
      <div class="row font-color-title margin-top-30">
        <div class="col-md-6 col-sm-6 center">Sản phẩm</div>
        <div class="col-md-2 col-sm-2">Đơn giá</div>
        <div class="col-md-2 col-sm-2">Số lượng</div>
        <div class="col-md-2 col-sm-2">Thành tiền</div>
      </div>
      <div
        class="row margin-top align-item-center"
        v-for="item in counterStore.arrTicked"
        :key="item.id"
      >
        <hr />
        <div class="col-md-3 col-sm-3">
          <img class="pictureCart" :src="item.image" />
        </div>
        <div class="col-md-3 col-sm-3">{{ item.name }}</div>
        <div class="col-md-2 col-sm-2">{{ item.discountPrice }} VND</div>
        <div class="col-md-2 col-sm-2">{{ item.quantity }}</div>
        <div class="col-md-2 col-sm-2">
          {{ item.discountPrice * item.quantity }} VND
        </div>
      </div>
    </div>
    <hr />
    <div>
      <div class="row">
        <div class="col-md-6 col-sm-6">
          <textarea
            id="myTextArea"
            placeholder="Lưu ý cho người bán"
            class="textarea"
          ></textarea>
        </div>
        <div class="col-md-6 col-sm-6 font-color-title">
          <span class="color-shipping">Đơn vị vận chuyển: &ensp; </span>
          <a-select
            v-model:value="selectTypeShip"
            class="width-option"
            :dropdown-match-select-width="false"
            :placement="placement"
            :options="getTypeShip"
            @change="typeShipChange"
          >
          </a-select>
          <div>{{ date_ship }}</div>
          <div>Được đồng kiểm</div>
          <div>Phí vận chuyển: {{ price_ship }} VND</div>
        </div>
      </div>
    </div>
    <hr class="hidden-res" />
    <hr />
    <div class="row margin-top-15 middle-center">
      <div class="col-md-10 col-sm-10" style="text-align: right">
        <span>Tổng tiền hàng:</span>
      </div>
      <div class="col-md-2 col-sm-2">
        <span>{{ counterStore.billOrder }} VND</span>
      </div>
    </div>
    <div class="row margin-top-15 middle-center">
      <div class="col-md-10 col-sm-10" style="text-align: right">
        <span>Phí vận chuyển:</span>
      </div>
      <div class="col-md-2 col-sm-2">
        <span>{{ price_ship }} VND</span>
      </div>
    </div>
    <div class="row margin-top-15 middle-center">
      <div class="col-md-10 col-sm-10" style="text-align: right">
        <span>Tổng thanh toán:</span>
      </div>
      <div class="col-md-2 col-sm-2">
        <span class="totalBill"
          >{{ price_ship + counterStore.billOrder }} VND</span
        >
      </div>
    </div>
    <hr />
    <div class="text-align-right">
      <!-- <router-link :to="{ name: 'LayoutPage' }"> -->
        <button
          class="btn-order"
          @click="addOrder"
          :hidden="displayButon.hiddenButton"
        >
          Đặt hàng
        </button>
      <!-- </router-link> -->
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useCounterStore } from "@/stores";
import router from '@/router';
// import axios from "axios";
import { message } from "ant-design-vue";
const status = ref("Thay đổi");
const name = ref();
const phone = ref();
const arraySelect = ref();
const hiddenInfo = ref(true);
const getTypeShip = ref([]);
const selectTypeShip = ref();
// const date_ship = ref("")
const price_ship = ref(0);

const typeShipChange = (value) => {
  // var today = new Date();
  // var date = (count_day) => {
  //   return (today.getDate() + count_day) +
  //       "-" +
  //       (today.getMonth() + 1) +
  //       "-" +
  //       today.getFullYear();
  // }

  // if(selectTypeShip.value === 1)
  // {
  //   const day = date(0)
  //   date_ship.value = `Bạn sẽ nhận hàng vào ngày ${day}`;

  // } else if (selectTypeShip.value === 2)
  // {
  //   const day_start = date(2)
  //   const day_end = date(4)
  //   date_ship.value = `Bạn sẽ nhận hàng từ ngày ${day_start} đến ngày ${day_end}`;
  // } else {
  //   const day_start = date(3)
  //   const day_end = date(5)
  //   date_ship.value = `Bạn sẽ nhận hàng từ ngày ${day_start} đến ngày ${day_end}`;
  // }
  for (let i = 0; i < counterStore.getAllTypeShip.length; i++) {
    if (counterStore.getAllTypeShip[i].id === value) {
      price_ship.value = counterStore.getAllTypeShip[i].price;
      return;
    }
  }
};
onMounted(async () => {
  const idCustom = JSON.parse(localStorage.getItem("idCustomer"));
  counterStore.productTicked();
  await counterStore.getTypeShip();
  await counterStore.fetchInfoDelivery(idCustom);
  console.log(counterStore.getListInfo)
  for (let i = 0; i < counterStore.getAllTypeShip.length; i++) {
    getTypeShip.value.push({
      label: counterStore.getAllTypeShip[i].type,
      value: counterStore.getAllTypeShip[i].id,
    });
  }
  counterStore.totalBillOrder();
  // const cusId = JSON.parse(localStorage.getItem("idCustomer"));
  // await counterStore.fetchInfoDelivery(cusId);
  try {
    // await counterStore.fetchOrderById(cusId);
  } catch (error) {
    console.log("Khách hàng này chưa có đơn hàng!");
  }

  if (counterStore.getListInfo.length === 0) {
    status.value = "Thêm địa chỉ";
  }
});
const displayButon = computed(() => {
  let status = true;
  if (counterStore.getListInfo.length !== 0) {
    status = false;
  }
  return { hiddenButton: status };
});
const optionsOne = computed(() => {
  return counterStore.getListInfo.map((info) => ({
    value: info.id, // Giả sử id là giá trị duy nhất cho mỗi option
    label: `${info.shipName}, ${info.shipPhoneNumber}, ${info.shipAddress}`, // Sử dụng một trường nào đó từ info để làm label
  }));
});
const focus = () => {
  // console.log("focus");
};
const handleDelete = async () => {
  if (!valueOne.value) {
    message.error("Vui lòng chọn 1 địa chỉ mà bạn muốn xoá!");
  } else {
    const result = await counterStore.deleteInDelivery(valueOne.value);
    console.log("result", result)
    if (result.statusCode === 200) {
      message.success("Đã xoá thành công địa chỉ!");
      resetForm()
    } else {
      message.error("Something was wrong. Please try it again later.");
    }
    // const indexToUpdate = counterStore.getListInfo.findIndex(
    //   (item) => item.id === counterStore.valueSelect
    // );
    // counterStore.getListInfo.splice(indexToUpdate, 1);
    // const cusId = JSON.parse(localStorage.getItem("idCustomer"))
    onClose();
  }
};

const handSelect = (value) => {
  const selectedInfo = counterStore.getListInfo.find(
    (info) => info.id === value
  );
  form.name = selectedInfo.shipName;
  form.phone = selectedInfo.shipPhoneNumber;
  form.email = selectedInfo.shipEmail;
  form.specificAddress = selectedInfo.shipAddress;
  valueOne.value = selectedInfo.id;
};

const handleChange = (value) => {
  counterStore.valueSelect = value;
  const selectedInfo = counterStore.getListInfo.find(
    (info) => info.id === value
  );

  // Cập nhật giá trị cho các trường input
  form.name = selectedInfo.name;
  form.phone = selectedInfo.phone;
  form.specificAddress = selectedInfo.specificAddress;
  // form.description = selectedInfo.description;

  // Cập nhật lại giá trị của valueOne để hiển thị trên <a-select>
  valueOne.value = selectedInfo.id;
};

const handleClear = () => {
  resetForm();
};

const checkInfoExist = () => {
  let statusExist = false;
  for (let i = 0; i < counterStore.getListInfo.length; i++) {
    if (
      counterStore.getListInfo[i].shipName === form.name &&
      counterStore.getListInfo[i].shipPhoneNumber === form.phone &&
      counterStore.getListInfo[i].shipAddress === form.specificAddress &&
      counterStore.getListInfo[i].shipEmail === form.email 
    ) {
      statusExist = true;
    } else {
      statusExist = false;
    }
  }
  return statusExist;
};

const handleUpdate = async () => {
  if (form.name === "" || form.phone === "" || form.specificAddress === "") {
    message.error("Vui lòng chọn 1 địa chỉ mà bạn muốn sửa đổi!");
  } else {
    if (checkInfoExist === true) {
      message.error("Địa chỉ này đã tồn tại!");
    } else {
      const indexToUpdate = counterStore.getListInfo.findIndex(
        (item) => item.id === counterStore.valueSelect
      );
      // const indexToUpdate = counterStore.getListInfo[findIndex]
      if (indexToUpdate !== -1) {
        // Create the updated object

        const data = {
          id: counterStore.valueSelect,
          shipName: form.name,
          shipPhoneNumber: form.phone,
          shipEmail: form.email,
          shipAddress: form.specificAddress,
        };
        const result = await counterStore.editAddressUser(data);
        if (result.statusCode === 200) {
          message.success("Updated!");
        }
        // const cusId = JSON.parse(localStorage.getItem("idCustomer"));
        else {
          message.error("Something went wrong. Please comback later!");
        }
        onClose();
      } else {
        console.log(`Item with id ${counterStore.valueSelect} not found`);
      }
    }
  }
};
// const hidden = ref(true);
// const totalOrder = ship + counterStore.billOrder;
// const arr = ref([]);

const counterStore = useCounterStore();
// const ship = ref(15);
// const formDataArray = ref([]);
const form = reactive({
  name: "",
  phone: "",
  email: "",
  specificAddress: "",
  // description: "",
});
const rules = {
  name: [
    {
      required: true,
      message: "Please enter user name",
    },
  ],
  phone: [
    {
      required: true,
      message: "Please enter your phone number",
    },
  ],
  specificAddress: [
    {
      required: true,
      message: "Please choose your specific address",
    },
  ],
  email: [
    {
      require: true,
      message: "Please enter your email",
    },
  ],
};
const open = ref(false);

const showDrawer = () => {
  open.value = true;
};

const onClose = () => {
  resetForm()
  if (formRef.value) {
    open.value = false;
  }
  valueOne.value = ''
};

const resetForm = () => {
  form.name = '',
  form.email = '',
  form.phone = '',
  form.specificAddress = ''
}

const handleSubmit = () => {
  //  formDataArray.value = JSON.parse(localStorage.getItem("infoDelivery")) || [];
  if (
    form.name === "" ||
    form.phone === "" ||
    form.email === "" ||
    form.specificAddress === ""
  ) {
    message.error("Vui lòng nhập đầy đủ thông tin!");
  } else {
    if (checkInfoExist === true) {
      message.error("Địa chỉ này đã tồn tại!");
    } else {
      const customerId = JSON.parse(localStorage.getItem("idCustomer"));
      formRef.value.validate().then(async (valid) => {
        if (valid) {
          const arrForm = {
            userId: customerId,
            shipName: form.name,
            shipPhoneNumber: form.phone,
            shipEmail: form.email,
            shipAddress: form.specificAddress,
          };
          counterStore.getListInfo.push(arrForm);
          const result = await counterStore.addAddressUser(arrForm)
          if(result.statusCode === 200)
          {
            message.success("Thêm địa chỉ thành công!");
          }
          else {
            message.error("Something was wrong. Please comback later!");
          }
          resetForm();
          onClose();
        } else {
          console.log("Form is not valid");
        }
      });
    }
  }
};

const selectDelivery = () => {
  if (
    form.name === "" ||
    form.phone === "" ||
    form.email === "" ||
    form.specificAddress === ""
  ) {
    message.error("Vui lòng chọn 1 địa chỉ!");
  } else {
    hiddenInfo.value = false;
    const index = counterStore.getListInfo.findIndex(
      (item) => item.id === counterStore.valueSelect
    );
    name.value = counterStore.getListInfo[index].shipName;
    phone.value = counterStore.getListInfo[index].shipPhoneNumber;
    arraySelect.value = counterStore.getListInfo[index].shipAddress;
    resetForm();
    onClose();
  }
};

const valueOne = ref("");

// watch(
//   () => getInfoDeliver.value.arraySelect,
//   (newArraySelect) => {
//     valueOne.value = newArraySelect;
//   }
// );

const addOrder = async () => {
  if(!selectTypeShip.value)
  {
    message.error("Vui lòng chọn phương thức vận chuyển");
    return
  }
  if(!counterStore.valueSelect) {
    message.error('Vui lòng chọn địa chỉ');
    return
  }
  const idC = JSON.parse(localStorage.getItem("idCustomer"));
  let element = document.getElementById("myTextArea");
  const arr = [];
  for (let i = 0; i < counterStore.arrTicked?.length; i++) {
    const object = {
      productId: counterStore.arrTicked?.[i]?.id,
      quantity: counterStore.arrTicked?.[i]?.quantity,
    };
    arr.push(object);
  }
  const index = counterStore.getListInfo.findIndex(
      (item) => item.id === counterStore.valueSelect
    );
  const arrOrder = {
    addressUserId: counterStore.valueSelect,
    typeShipId: selectTypeShip.value,
    isPaymentOnline: false,
    arrDataShopCart: arr,
    userId: idC,
    note: element.value,
    shipName: counterStore.getListInfo[index]?.shipName ,
    shipAddress:counterStore.getListInfo[index]?.shipAddress ,
    shipEmail: counterStore.getListInfo[index]?.shipEmail ,
    shipPhoneNumber: counterStore.getListInfo[index]?.shipPhoneNumber ,
  };
  const result = await counterStore.createOrder(arrOrder);
  if(result.statusCode === 200)
  {
    message.success("Đặt hàng thành công!");
    router.push('/order-tracking');
    for (let i = 0; i < counterStore.listCarts.length; i++) {
    for (let j = 0; j < counterStore.arrTicked.length; j++) {
      if (counterStore.listCarts[i].id === counterStore.arrTicked[j].id) {
        counterStore.listCarts.splice(i, 1); //xóa hết phần tử counterStore.listCart[i]
      }
    }
  }
  // localStorage.setItem("updateCart", JSON.stringify(counterStore.listCarts));
  }
  else {
    message.error("Something was wrong. Please comback and try it later!");
  }
};

const formRef = ref(null);

// const loadDistricts = () => {
//   console.log("Selected City:", form.city);
//   callApiDistrict(`${host}p/${form.city}?depth=2`);
//   printResult();
// };

// const loadWards = () => {
//   console.log("Selected District:", form.ward);
//   callApiWard(`${host}d/${form.district}?depth=2`);
//   printResult();
// };

// const callApiDistrict = (api) => {
//   axios.get(api).then((response) => {
//     districts.value = response.data.districts;
//   });
// };

// const callApiWard = (api) => {
//   axios.get(api).then((response) => {
//     wards.value = response.data.wards;
//   });
// };

// const printResult = () => {
//   // if (
//   //   selectedCity.value !== "" &&
//   //   selectedDistrict.value !== "" &&
//   //   selectedWard.value !== ""
//   // ) {
//   //   result.value = `${getCityName()} | ${getDistrictName()} | ${getWardName()}`;
//   // }
//   console.log("Thành phố:", getCityName());
//   console.log("Quận:", getDistrictName());
//   console.log("Phường:", getWardName());
//   if (form.city !== "" && form.district !== "" && form.ward !== "") {
//     result.value = `${getCityName()} | ${getDistrictName()} | ${getWardName()}`;
//   }
// };
</script>

<style lang="scss" scoped>
.margin-left {
  margin-left: 30px;
}
.align-item-center {
  display: flex;
  align-items: center;
}
.center {
  text-align: center;
}
.margin-top {
  margin-top: 10px;
}
.pictureCart {
  width: 20%;
  height: auto;
  margin-left: 30px;
}
.middle-center {
  display: flex;
  vertical-align: middle;
  align-items: center;
  font-size: 18px;
}
.btn-order {
  border: none;
  background-color: orangered;
  color: white;
  margin-top: 5px;
  padding: 12px 60px;
  font-size: 18px;
  &:hover {
    background-color: lightcoral;
  }
}
.margin-top-15 {
  margin-top: 15px;
  color: gray;
}
.displayForRes {
  display: none;
}
.text-align-right {
  text-align: right;
}
.text-align-left {
  text-align: left;
}
.bawp {
  display: flex;
  align-items: center;
}
.ajust {
  grid-column-start: 2;
  grid-column-end: 3;
}
.display-grid {
  display: grid;
  grid-template-columns: 1fr max-content max-content;
  grid-template: auto;
  padding-top: 15px;
}
.margin-top {
  margin-top: 10px;
}
.totalBill {
  color: orangered;
  font-size: 25px;
  font-weight: 500;
}
.textarea {
  width: 100%;
  height: 100%;
  padding: 10px;
}
.color-shipping {
  color: green;
}
.text-align-right {
  text-align: right;
  margin-right: 20px;
}
.margin-top-30 {
  margin-top: 30px;
  margin-bottom: 30px;
}
.font-color-title {
  color: gray;
}
.button-add-address {
  border: none;
  border-radius: 5px;
  background-color: orangered;
  color: white;
  margin-top: 5px;
  // padding: 8px 20px;
  &:hover {
    background: #f18d9b;
  }
}
.font-color {
  color: orangered;
  font-size: 20px;
  margin-top: 10px;
  margin-left: 20px;
}
.backgr-img {
  height: 3px;
  width: 100%;
  background-position-x: -30px;
  background-size: 116px 3px;
  background-image: repeating-linear-gradient(
    45deg,
    #6fa6d6,
    #6fa6d6 33px,
    transparent 0,
    transparent 41px,
    #f18d9b 0,
    #f18d9b 74px,
    transparent 0,
    transparent 82px
  );
}
@media screen and (max-width: 1023px) {
  .textarea {
    width: 80%;
  }
  .hidden-res {
    display: none;
  }
}
@media screen and (max-width: 800px) {
  .container {
    padding: 0px;
  }
  .displayForRes {
    display: block;
  }
}
.flex-container {
  display: flex;
}

.flex-item {
  flex: 1;
  width: 100%;
}
.ant-select-dropdown {
  min-width: 100%;
}
</style>
