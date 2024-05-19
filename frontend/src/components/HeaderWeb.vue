<template>
  <div
    id="header"
    :class="currentRoute === 'AdminShop' ? 'isAdmin' : 'noneAdmin'"
  >
    <h1 class="heading">B&H Fashion</h1>
    <div class="bars">
      <h1 class="heading1">B&H Fashion</h1>
      <label for="nav-mobile-input" class="icon" @click="toggleMenu">
        <i
          :class="[
            'fa-solid',
            'fa-2x',
            { 'fa-bars': !isMenuOpen, 'fa-x': isMenuOpen },
            { rotate: isMenuOpen, rotate2: !isMenuOpen },
          ]"
        ></i
      ></label>
      <input type="checkbox" hidden class="nav_input" id="nav-mobile-input" />
      <Collapse :when="isMenuOpen">
        <div class="hidd">
          <div
            id="menu2"
            :class="currentRoute === 'LayoutPage' ? 'backgr1' : 'backgr2'"
          >
            <div class="row">
              <div class="col-sm-12">
                <div>
                  <router-link :to="{ name: 'LayoutPage' }"
                    ><span
                      :class="{ active: currentRoute === 'LayoutPage' }"
                      class="font-menu"
                      >HOME</span
                    ></router-link
                  >
                </div>
              </div>
              <div class="col-sm-12">
                <div>
                  <router-link :to="{ name: 'ShopPage' }"
                    ><span
                      :class="{ active2: currentRoute === 'ShopPage' }"
                      class="font-menu"
                      >SHOP</span
                    ></router-link
                  >
                </div>
              </div>
              <div class="col-sm-12">
                <a href="#"><span class="font-menu">WHY US</span></a>
                <!-- <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" /> -->
              </div>
              <!-- <div class="col-sm-12">
                <a href="#"><span class="font-menu"> TESTIMONIAL</span></a>
              </div> -->
              <div class="col-sm-12">
                <a href="#"><span class="font-menu">CONTACT US </span></a>
              </div>
              <div class="col-sm-12">
                <router-link :to="{ name: 'LoginAccount' }">
                  <a type="button" @click="toggleLogin"
                    ><i class="fa fa-user"></i
                    ><span class="font-menu-login"
                      >&nbsp;{{ counterStore.isLoggedIn }}</span
                    >&nbsp;&nbsp;&nbsp;&nbsp;</a
                  >
                </router-link>

                <router-link :to="{ name: 'ListCart' }">
                  <!-- <a style="position: relative; cursor: pointer"
                    ><i
                      class="fa-solid fa-cart-shopping"
                      style="color: orangered"
                    ></i>
                    <p id="count" style="display: inline">
                      {{ counterStore.countC }}
                    </p>
                  </a> -->
                  <a-badge :count="countCart" :overflow-count="99">
                    <a-avatar size="large" style="background-color: orangered"
                      ><i
                        class="fa-solid fa-cart-shopping"
                        style="color: white"
                      ></i
                    ></a-avatar>
                  </a-badge>
                </router-link>
                <a
                  >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i
                    class="fa fa-search"
                  ></i
                ></a>
              </div>
            </div>
          </div>
        </div>
      </Collapse>
    </div>
    <div
      id="menu"
      :class="currentRoute === 'LayoutPage' ? 'backgr1' : 'backgr2'"
    >
      <ul>
        <li :class="{ active: currentRoute === 'LayoutPage' }">
          <router-link :to="{ name: 'LayoutPage' }">HOME</router-link>
        </li>
        <li :class="{ active2: currentRoute === 'ShopPage' }">
          <router-link :to="{ name: 'ShopPage' }">SHOP</router-link>
        </li>
        <li>
          <a href="#">WHY US</a>
        </li>
        <!-- <li>
          <a href="#">TESTIMONIAL</a>
        </li> -->
        <li>
          <a href="#">CONTACT US</a>
        </li>
        <li>
          <!-- <router-link :to="{ name: 'LoginAccount' }"> -->
          <!-- <a class="pointer" type="button" @click="toggleLogin" :hidden="hidden"
              ><i class="fa fa-user"></i><span>Login</span></a
            > -->
          <a class="pointer" type="button" @click="toggleLogin"
            ><i class="fa fa-user"></i
            ><span>{{ counterStore.isLoggedIn }}</span></a
          >
          <!-- </router-link> -->

          <!-- <router-link :to="{ name: 'ListCart' }"> -->
          <a @click="navigateToCart" class="pointer">
            <a-badge :count="countCart" :overflow-count="99">
              <a-avatar size="large" style="background-color: orangered"
                ><i class="fa-solid fa-cart-shopping" style="color: white"></i
              ></a-avatar>
            </a-badge>
          </a>
          <!-- <a style="position: relative; cursor: pointer"
              ><i
                class="fa-solid fa-cart-shopping"
                style="color: orangered"
              ></i>
              <p id="count" style="display: inline">
                {{ counterStore.countC }}
              </p>
            </a> -->
          <!-- </router-link> -->

          <a><i class="fa fa-search"></i></a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Collapse } from "vue-collapsed";
import { useCounterStore } from "@/stores";
import { message } from "ant-design-vue";

export default {
  name: "HeaderWeb",
  components: {
    Collapse,
  },
  data() {
    const counterStore = useCounterStore();
    // const accId = this.$route.params.idCustomer;
    const statusLogin = "Login";
    let hidden = false;
    let hidden2 = true;
    let countCart = counterStore.countC;
    const templ = JSON.parse(localStorage.getItem("idCustomer"));
    return {
      imageURL: "./assets/slider.png",
      currentRoute: null,
      isMenuOpen: false,
      alwaysTrue: true,
      counterStore,
      statusLogin,
      hidden,
      hidden2,
      templ,
      countCart
      // accId
    };
  },
  created() {
    // Lấy biến counterStore.countC từ Pinia store
    const counterStore = useCounterStore();

    // Sử dụng vm.$watch để theo dõi sự thay đổi của counterStore.countC
    this.$watch(
      () => counterStore.countC,
      (newVal) => {
        // Xử lý khi giá trị của counterStore.countC thay đổi
        this.countCart = newVal; // Cập nhật giá trị của biến A bằng giá trị mới của counterStore.countC
      }
    );
  },
  watch: {
    $route(to) {
      this.currentRoute = to.name; // Lưu tên đường dẫn hiện tại
      this.isMenuOpen = false;
    },
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen; // Đảo ngược trạng thái mở/đóng menu
    },
    toggleLogin() {
      // Thực hiện các bước đăng nhập hoặc đăng xuất tại đây
      // Ví dụ: Cập nhật trạng thái đăng nhập và xử lý đăng xuất
      const temp = JSON.parse(localStorage.getItem("idCustomer"));

      if (temp !== null) {
        localStorage.removeItem("idCustomer");
        message.success("Đã đăng xuất!");
        this.$router.push({ name: "LayoutPage" });
        this.counterStore.setLoggedIn("Login");
        localStorage.setItem("orderPending", JSON.stringify([]));
        localStorage.setItem("Logout", JSON.stringify("Login"));
        this.$router.push({ name: "LoginAccount" });
        localStorage.setItem("cart", JSON.stringify([]));
        localStorage.setItem("updateCart", JSON.stringify([]));
        // localStorage.setItem("token", JSON.stringify(""));
        localStorage.removeItem("token");
        this.counterStore.listCarts = [];
        this.counterStore.getListInfo = [];
      } else {
        this.$router.push({ name: "LoginAccount" });
      }
    },
    navigateToCart() {
      // Thực hiện chuyển route đến trang giỏ hàng
      const getId = JSON.parse(localStorage.getItem("idCustomer")) || 22222;
      if (getId === 22222) {
        message.error("Vui lòng đăng nhập");
      } else {
        this.$router.push({ name: "ListCart" });
      }
    },

    showLoginPrompt() {
      // Hiển thị thông báo đăng nhập
      alert("Vui lòng đăng nhập!");
    },
  },
  computed: {
    loginText() {
      return this.counterStore.isLoggedIn ? "Log out" : "Login";
    },
    hasIdCustomer() {
      return localStorage.getItem("idCustomer") !== null;
    },
  },
};
</script>


<style lang="scss" scoped>
.isAdmin {
  display: none;
}
.noneAdmin {
}
.pointer {
  cursor: pointer;
}
#count {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  padding: 0px 1px;
  background-color: #fff;
  color: orangered;
  font-size: 10px;
  position: absolute;
  left: 60%;
  bottom: 17%;
  font-weight: bold;
}

.row .col-sm-12 .font-menu {
  font-size: 15px;
  padding: 5px 25px;
}
.row .col-sm-12 .font-menu-login {
  font-size: 15px;
  cursor: pointer;
}
@keyframes rotateAnimation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(180deg);
  }
}
@keyframes rotateAnimation2 {
  100% {
    transform: rotate(180deg);
  }
  0% {
    transform: rotate(0deg);
  }
}
#header .icon .rotate {
  animation: rotateAnimation 0.2s ease forwards;
}

#header .icon .rotate2 {
  animation: rotateAnimation2 0.2s ease forwards;
}

.hidd {
  display: block;
}
.loading {
  position: flex;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  margin: auto;
}
.nav_input:checked ~ .hidd {
  display: block;
}
.backgr2 {
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.25);
  border-radius: 15px;
  background-color: white;
  margin: 0 40px;
}
.active {
  background-color: white;
  border-radius: 5px;
  // padding: 6px 25px;
}
.active3 {
  background-color: white;
  border-radius: 5px;
  // padding: 6px 25px;
}
.active2 {
  background-color: #f4f5f6;
  border-radius: 5px;
  // padding: 6px 25px;
}
#header {
  font-family: "poppins", sans-serif;
  position: relative;
}
.homepage {
  background-color: white;
  border-radius: 5px;
}
h1 {
  text-align: center;
}
.heading {
  font-family: "poppins", sans-serif;
  font-weight: bold;
  font-size: 35px;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
}
#menu ul {
  list-style-type: none;
  text-align: center;
  border-radius: 15px 15px 0 0;
  padding: 15px 0;
  margin-bottom: 0;
  li {
    display: inline-table;
    // padding: 6px 20px;
    a {
      text-decoration: none;
      color: #514f4f;
      font-size: 18px;
      padding: 10px 15px;
    }
  }
}
#menu2 {
  list-style-type: none;
  text-align: center;
  border-radius: 15px 15px 0 0;
  padding: 15px 0;
  margin-bottom: 0;
  a {
    text-decoration: none;
    color: #514f4f;
    font-size: 18px;
    // padding: 10px 25px;
  }
}
.backgr1 {
  margin: 0 45px;
  background-color: #f9ece6;
  border-radius: 15px 15px 0 0;
  // margin-top: 20px;
}
.icon {
  position: absolute;
  right: 0px;
}
.bars {
  display: none;
  margin-top: 15px;
  padding-bottom: 0px;
  margin-bottom: 0;
}
@media screen and (max-width: 1023px) {
  .backgr2 {
    margin: 0 0;
  }
  .row .col-sm-12 .font-menu-login {
    font-size: 14px;
    font-weight: 510;
  }
  .col-sm-12 {
    padding: 5px;
  }
  #count {
    left: 71%;
    bottom: -12%;
  }
  .row .col-sm-12 .font-menu {
    font-size: 14px;
    font-weight: 510;
  }
  #menu {
    display: none;
  }
  .heading {
    display: none;
  }
  .heading1 {
    text-align: left;
    padding-left: 45px;
    font-size: 32px;
    font-family: "poppins", sans-serif;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 20px;
    display: inline;
  }
  .bars {
    display: block;
  }
  .icon {
    text-align: right;
    padding-right: 45px;
    margin-bottom: 20px;
    display: inline;
  }
}
@media screen and (min-width: 375px) and (max-width: 811px) {
  .backgr1 {
    margin: 0;
  }
  // .backgr2 {
  //   margin: 0 0;
  // }
}
@media screen and (max-width: 320px) {
  .backgr1 {
    margin: 0;
  }
  .heading {
    font-size: 30px;
  }
  .backgr2 {
    margin: 0 0;
  }
}
@media screen and (max-width: 576px) {
  .backgr2 {
    margin: 0 0;
  }
}
</style>
