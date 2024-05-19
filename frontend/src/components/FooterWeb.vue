<template>
  <div :class="currentRoute === 'AdminShop' ? 'isAdmin' : 'noneAdmin'">
    <div class="backgr-footer">
      <div class="row">
        <div class="col-md-12">
          <div class="logo">
            <i class="fab">&#xf39e;&nbsp;&nbsp;</i>
            <i class="fab">&#xf16d;&nbsp;&nbsp;</i>
            <i class="fab fa-twitter">&nbsp;&nbsp;</i>
            <i class="fab fa-youtube">&nbsp;&nbsp;</i>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="row">
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="font-footer">
              <h5 class="font-footer-title">Vision</h5>
              <p>Hướng đến chất lượng hơn số lượng</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="font-footer">
              <h5 class="font-footer-title">Newsletter</h5>
              <input
                type="text"
                placeholder="Enter your email"
                class="input-footer"
              />
              <button class="btn-footer">SUBSCRIBE</button>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="font-footer">
              <h5 class="font-footer-title">Help</h5>
              <p>Nếu có bất cứ thắc mắc nào, đừng ngần ngại và liên hệ với chúng tôi theo thông tin liên hệ bên dưới.</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="font-footer">
              <h5 class="font-footer-title">
                Contact
              </h5>
              <div id="icon" class="margin-contact-footer">
                <a href="#" style="text-decoration: none" class="icon-contact"
                  ><i class="fa fa-map-marker">&nbsp;&nbsp;</i
                  ><span>43 Nguyễn Xí, phường 5, quận Bình Thạnh, TP HCM</span></a
                >
              </div>
              <div class="margin-contact-footer">
                <a
                  id="hove"
                  href="#"
                  style="text-decoration: none"
                  class="icon-contact"
                  ><i class="fa fa-phone">&nbsp;</i>+02 72 3837837</a
                >
              </div>
              <div class="margin-contact-footer">
                <a href="#" style="text-decoration: none" class="icon-contact"
                  ><i class="fa fa-envelope">&nbsp;</i>bnhclothing@gmail.com.vn</a
                >
              </div>
            </div>
          </div>
        </div>
        <div class="line">
          <hr />
        </div>
        <div class="center-footer">
          © 2023 All Rights Reserved By Free Html Templates
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCounterStore } from "@/stores/index";
import { onMounted } from "vue";
const counterStore = useCounterStore();
let array = [];

onMounted(async () => {
  // await counterStore.fetchApiFooterAbout();
  // await counterStore.fetchApiFooterContact();
  // await counterStore.fetchApiFooterHelp();
  // Lặp qua mỗi phần tử trong mảng "result"
  counterStore.contact.forEach(function (item) {
    // Truy cập các trường trong từng phần tử
    var content = item.content;
	array.push(content);
  });
});
</script>

<script>
// import { useRoute } from 'vue-router';
// const footer = [
//   {

//   }
// ]
export default {
  data(){
    return {
      currentRoute: null
    }
  }, 
  watch: {
    $route(to) {
      this.currentRoute = to.name; // Lưu tên đường dẫn hiện tại
      // this.isMenuOpen = false;
    },
  },
}
</script>
<style scoped>
.isAdmin {
  display: none;
}
.noneAdmin {

}
.logo {
  color: white;
  text-align: center;
  font-size: 24px;
  margin-top: 40px;
  margin-bottom: 20px;
}
.backgr-footer {
  background-color: #2d2d2d;
  margin: 15px 45px;
  padding-bottom: 20px;
  margin-top: 80px;
}
.btn-footer {
  background-color: #f89cab;
  color: white;
  padding: 8px 35px;
  margin: 15px 0 0;
}
.input-footer {
  width: 100%;
  padding: 7px 10px;
  outline: none;
  margin-top: -10px;
}
.font-footer-title {
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
}
.font-footer {
  color: #cbc9c9;
}
.margin-contact-footer {
  margin-bottom: 10px;
  text-decoration: none;
}
.center-footer {
  text-align: center;
  color: #cbc9c9;
  margin-bottom: 20px;
}
.footer-icon {
  text-decoration: none;
}
.icon-contact {
  color: #cbc9c9;
}
a:hover {
  color: white;
}
.line {
  color: #fff;
  padding-left: 100px;
  padding-right: 100px;
}
@media screen and (min-width: 740px) and (max-width: 1023px) {
  .col-md-6 {
    padding-top: 20px;
  }
  .logo {
    margin-bottom: 0;
  }
}
@media only screen and (max-width: 739px) {
  .row {
    text-align: center;
  }
  .col-md-6 {
    margin-top: 30px;
  }
  .logo {
    margin-bottom: 0;
  }
}

@media screen and (min-width: 375px) and (max-width: 767px) {
  .col-sm-12 {
    margin: 0;
  }
  .center-footer {
    font-size: 15px;
  }
  .logo {
    font-size: 18px;
  }
  .backgr-footer {
    margin: 0;
    margin-top: 45px;
  }
  .btn-footer {
    padding: 5px 20px;
    margin: 15px 0 10px;
  }
  .input-footer {
    width: 80%;
  }
}

@media screen and (max-width: 320px) {
  .font-footer {
    font-size: 12px;
  }
  .font-footer-title {
    font-size: 15px;
  }
  .col-sm-12 {
    margin: 0;
  }
  .center-footer {
    font-size: 12px;
  }
  .logo {
    font-size: 18px;
  }
  .backgr-footer {
    margin: 0;
    margin-top: 45px;
  }
  .btn-footer {
    padding: 5px 20px;
    margin: 15px 0 10px;
  }
  .input-footer {
    width: 80%;
  }
}
</style>
