<template>
  <div>
    <section class="container shadow">
      <div class="row">
        <div class="col-md-6 content-center">
          <img class="pic-login" src="@/assets/images/login_1.jpeg" />
        </div>
        <div class="col-md-6 content-center">
          <a-form
            :model="formState"
            name="basic"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 12 }"
            autocomplete="off"
            @finish="onFinish"
            @finishFailed="onFinishFailed"
          >
          <h1 class="login">LOGIN</h1>
            <a-form-item
              label="Username"
              name="username"
              :rules="[
                { required: true, message: 'Please input your username!' },
              ]"
            >
              <a-input
                v-model:value="formState.username"
                class="border-none"
                ref="userNameInput"
              />
            </a-form-item>

            <a-form-item
              label="Password"
              name="password"
              :rules="[
                { required: true, message: 'Please input your password!' },
              ]"
            >
              <a-input-password
                v-model:value="formState.password"
                class="border-none"
                ref="passwordInput"
              />
              <div class="d-flex justify-content-between mt-15">
              <a class="forgot-pass" href="#">Forgot password</a>
              <router-link :to="{ name: 'RegisterAccount' }"
                  ><a href="#">Register now!</a></router-link
                >
            </div>
            <a-button class="btn-welcome mt-15" html-type="submit">LOGIN</a-button>
            </a-form-item>
            <a-alert
              v-show="isError"
              :message="nameError"
              type="error"
              show-icon
            >
              <template #icon><smile-outlined /></template>
            </a-alert>
          </a-form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { message } from "ant-design-vue";
import { SmileOutlined } from "@ant-design/icons-vue";
// import { stringify } from "uuid";
import { onMounted, reactive } from "vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useCounterStore } from "@/stores";
// import { useRouter } from "vue-router";
const userNameInput = ref(null);
const counterStore = useCounterStore();
const passwordInput = ref(null);
const idAcc = ref(null);
const isError = ref(false);
const nameError = ref(null);
const token = ref(null);
// const arrAccount = ref([]);
const router = useRouter();
// const router = useRouter();
// const arrCartForAcc = ref([]);
const formState = reactive({
  username: "",
  password: "",
  remember: true,
});
const onFinish = (values) => {
  console.log("Success:", values);
  checkLoginAccountCustomer();
  localStorage.setItem("whologin", JSON.stringify(idAcc.value));
  console.log(idAcc.value);
  localStorage.setItem("Logout", JSON.stringify("Log out"));
  counterStore.setLoggedIn("Log out");
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};
onMounted(async () => {});

const checkLoginAccountCustomer = async () => {
  const formLogin = {
    phoneNumber: formState.username,
    password: formState.password,
  };
  await counterStore.checkLoginAccount(formLogin);
  if (counterStore.checkLogin.statusCode !== 200) {
    // message.error(counterStore.checkLogin.errors[0]);
    console.log("Hello from login: ", counterStore.checkLogin.errors[0]),
      (nameError.value = counterStore.checkLogin?.errors[0]);
    console.log(counterStore.checkLogin);
    if (counterStore.checkLogin?.statusCode === 401) {
      formState.password = "";
      passwordInput.value.focus();
    } else if (counterStore.checkLogin?.statusCode === 404) {
      formState.username = "";
      userNameInput.value.focus();
    }
    isError.value = true;
  } else {
    message.success("Đăng nhập thành công!");
    router.push({ name: "LayoutPage" });
    token.value = counterStore.checkLogin?.result[0].accessToken;
    let id = counterStore.checkLogin?.result[0].userId;
    localStorage.setItem("token", JSON.stringify(token.value));
    localStorage.setItem("idCustomer", JSON.stringify(id));
    localStorage.setItem("Logout", JSON.stringify("Log out"));
    counterStore.setLoggedIn("Log out");
    await counterStore.fetchListCustomerCart(4);
    const arr1 = counterStore.getListCart || [];
    console.log(arr1);
    const targetCart = arr1 || [];
    counterStore.listCarts = targetCart;
  }
  // const status = counterStore.checkLogin.statusCode;
  // if (status === 200) {
  //   const customerId = counterStore.checkLogin.result[0].customerID;
  //   message.success("Đăng nhập thành công!");
  //   router.push({ name: "LayoutPage" });
  //   // idAcc.value = arrAccount.value[counterStore.checkLogin.result[2].customerID].id;
  //   await counterStore.fetchListCustomerCart(customerId);
  //   localStorage.setItem("idCustomer", JSON.stringify(customerId));
  //   const arr1 = counterStore.getListCart || [];
  //   const targetCart = arr1 || [];
  //   counterStore.listCarts = targetCart;
  //   localStorage.setItem("Logout", JSON.stringify("Log out"));
  //   counterStore.setLoggedIn("Log out");
  // } else if (status === 401) {
  //   // message.error("");
  //   formState.password = "";
  //   formState.username = "";
  //   userNameInput.value.focus();
  //   message.error("Tài khoản chưa được đăng ký!");
  // } else if (status === 403) {
  //   message.error("Sai mật khẩu!");
  //   formState.password = "";
  //   passwordInput.value.focus();
  // } else {
  //   message.error("Sai mật khẩu hoặc username!");
  // }
};

// const checkLogin = async () => {
//   const formLogin = {
//     phoneNumber: formState.username,
//     password: formState.password
//   }
//   await counterStore.checkLoginAccount(formLogin);
//   // if(counterStore.this
//   console.log("This is checklogin: ", counterStore.checkLogin);
// };

// const loginAccount = async () => {
//   // arrAccount.value = JSON.parse(localStorage.getItem("listAcc")) || [];
//   arrAccount.value = counterStore.getListAcc;
//   // console.log(arrAccount.value);
//   const getIndexByUsername = arrAccount.value.findIndex(
//     (item) => item.phone === formState.username
//   );
//   if (getIndexByUsername !== -1) {
//     if (arrAccount.value[getIndexByUsername].password === formState.password) {
//       message.success("Đăng nhập thành công!");
//       router.push({ name: "LayoutPage" });
//       idAcc.value = arrAccount.value[getIndexByUsername].id;
//       await counterStore.fetchListCustomerCart(idAcc.value);
//       localStorage.setItem("idCustomer", JSON.stringify(idAcc.value));
//       const arr1 = counterStore.getListCart || [];
//       // console.log();
//       console.log(arr1);
//       console.log(arr1.cart);
//       const targetCart = arr1.cart || [];
//       console.log(targetCart);
//       counterStore.listCarts = targetCart;
//       localStorage.setItem("Logout", JSON.stringify("Log out"));
//       counterStore.setLoggedIn("Log out");
//     } else {
//       message.error("Sai mật khẩu!");
//       formState.password = "";
//       passwordInput.value.focus();
//       // counterStore.setLoggedIn("Log out");
//     }
//   } else {
//     formState.password = "";
//     formState.username = "";
//     userNameInput.value.focus();
//     message.error("Tài khoản chưa được đăng ký!");
//   }
// };
</script>

<style lang="scss" scoped>
@import "@/style/styles.scss";
.mt-15 {
  margin-top: 15px;
}
.pic-login {
  width: 100% !important;
  height: auto !important;
}
.content-center {
  align-self: center;
}
.border-none {
  border-radius: 0;
}
.shadow {
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.25);
  margin-top: 45px;
  //    padding: 60px;
}
.space {
  justify-content: space-between;
}
.login {
  text-align: center;
  margin: 40px 0;
}
.btn-welcome {
  background-color: #6f42c1;
  border: 1px solid #6f42c1;
  font-size: 16px;
  color: $font-color;
  border-radius: 0;
  width: 100%;
  &:hover {
    background-color: #f89cab;
    color: $button;
    border: 1px solid $button;
  }
}
.text-align-center {
  text-align: center;
  margin-top: 0;
}
a {
  text-decoration: none;
}
.forgot-pass {
  text-align: center;
}
</style>
