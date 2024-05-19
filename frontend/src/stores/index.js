import { defineStore } from "pinia";
import * as savingServices from "@/apiService/savingServices";
// import * as request from "@/utils/request";
export const useCounterStore = defineStore("counter", {
  state: () => ({
    isLoading: 0,
    data: null,
    products: [],
    children: [],
    gift: [],
    sections: [],
    feedback: [],
    about: [],
    help: [],
    contact: [],
    listProducts: [],
    checkLogin: [],
    perPage: 8,
    countProduct: 0,
    product: {},
    // countPlus: 0,
    listAcc: [],
    countC: Number,
    countQuantity: 1,
    count: 1,
    listCarts: [],
    total: Number(0),
    check: Boolean,
    checkedbox: true,
    arrayTicked: [],
    arrProduct: [],
    billOrder: 0,
    infoDeliveryDetail: [],
    listAccount: [],
    checkedSomeToAll: false,
    arrTicked: [],
    getListAcc: [],
    getListCart: [],
    getListInfo: [],
    getListOrderById: [],
    isLoggedIn: JSON.parse(localStorage.getItem("Logout")),
    valueSelect: Number,
    arrInfo: [],
    getAllTypeShip: []
  }),
  actions: {
    setLoggedIn(value) {
      this.isLoggedIn = value;
    },
    infoDelivery() {
      this.infoDeliveryDetail =
        JSON.parse(localStorage.getItem("infoDelivery")) || [];
    },
    async getTypeShip() {
      try {
        this.isLoading++;
        const arr = await savingServices.type_ship();
        this.getAllTypeShip = arr.result;
        this.isLoading--;
      }
      catch (error) {
        console.error("Error in productTicked:", error);
      }
    },
    totalBillOrder() {
      try {
        this.billOrder = 0;
        for (let i = 0; i <= this.arrTicked.length; i++) {
          this.billOrder +=
            this.arrTicked[i].discountPrice
            * this.arrTicked[i].quantity;
        }
        // console.log(this.arrayTicked);
      } catch (error) {
        console.error("Error in productTicked:", error);
      }
    },
    productTicked() {
      // const arr = this.listCarts;
      // localStorage.setItem("orderPending", JSON.stringify([]));
      this.arrTicked = [];
      // const count = 0;
      for (let i = 0; i < this.listCarts?.length; i++) {
        if (this.listCarts[i].status === true) {
          this.arrTicked = this.arrTicked.concat(this.listCarts[i]);
          localStorage.setItem("orderPending", JSON.stringify(this.arrTicked));
        }
      }
      this.arrTicked = JSON.parse(localStorage.getItem("orderPending")) || [];
    },

    async buyNow(id, value) {
      await this.fetchEachProduct(id);
      this.arrTicked = [];
      this.product.quantity = value;
      this.arrTicked = this.arrTicked.concat(this.product);
      this.billOrder = this.product.quantity * this.product.price;
      if (this.arrTicked.length === 0) {
        this.arrTicked = JSON.parse(localStorage.getItem("orderPending")) || [];
        this.billOrder = this.arrTicked[0].quantity * this.arrTicked[0].price;
      } else {
        localStorage.setItem("orderPending", JSON.stringify(this.arrTicked));
      }
    },
    totalBill() {
      this.total = 0;
      for (let i = 0; i < this.listCarts?.length; i++) {
        this.total =
          this.total +
          Number(this.listCarts[i].price * this.listCarts[i].quantity);
      }
      return this.total;
    },
    totalEachProduct(id) {
      // const totalEach = 0;
      const findIndexProductByID = this.listCarts.findIndex(
        (item) => item.id === id
      );
      const totalEach = Number(
        this.listCarts[findIndexProductByID]?.discountPrice *
          this.listCarts[findIndexProductByID]?.quantity
      );
      return totalEach;
    },
    countCart() {
      this.countC = this.listCarts.length;
    },
    async addToCart(sanpham, value) {
      // const idCus = JSON.parse(localStorage.getItem("idCustomer"));
      const findIndexProductByID = this.listCarts.findIndex(
        (item) => item.id === sanpham.id
      );
      if (findIndexProductByID !== -1) {
        if (value !== 1) {
          this.listCarts[findIndexProductByID].quantity = value;
        } else {
          this.listCarts[findIndexProductByID].quantity += 1;
        }
      } else {
        this.listCarts.push({ ...sanpham, quantity: value });
      }
      localStorage.setItem("cart", JSON.stringify(this.listCarts));
      //  await this.addToCartCustomer(this.listCarts);
      // await this.removeCart(idCustom);
      // const arrr = {id: idCustom, cart: this.listCarts};
      // await this.addCartForAcc(arrr);
    },
    async increaseQuantity(id,quantity,sizeId) {
      // const findIndexProductByID = this.listCarts.findIndex(
      //   (item) => item.id === id
      // );
      // const idCustom = JSON.parse(localStorage.getItem("idCustomer"));
      // this.listCarts[findIndexProductByID].quantity += 1;
      // localStorage.setItem("cart", JSON.stringify(this.listCarts));
      // await this.removeCart(idCustom);
      // const arrr = { id: idCustom, cart: this.listCarts };
      // await this.addCartForAcc(arrr);
      this.isLoading++;
      const idCustom = JSON.parse(localStorage.getItem("idCustomer"));
      const data = {userId: idCustom, sizeId: sizeId, quantity: quantity}
      await savingServices.addItemToCart(data)
      this.isLoading--;
    },
    async decreaseQuantity(id,quantity,sizeId) {
      // const findIndexProductByID = this.listCarts.findIndex(
      //   (item) => item.id === id
      // );
      this.isLoading++;
      const idCustom = JSON.parse(localStorage.getItem("idCustomer"));
      // const cartId = await this.fetchCartIdByCustomerId(idCustom);
      const data = {userId: idCustom, sizeId: sizeId, quantity: quantity}
      await savingServices.addItemToCart(data)
      // await this.addItemToCustomerCart(cartId,id,quantity);
      this.isLoading--;
      // this.listCarts[findIndexProductByID].quantity -= 1;
      // this.countCart();
      // localStorage.setItem("cart", JSON.stringify(this.listCarts));
      // this.removeCart(idCustom).then(() => {
      //   const arrr = { id: idCustom, cart: this.listCarts };
      //   this.addCartForAcc(arrr);
      // });
    },
    async inputQuantity(id, value, sizeId) {
      this.isLoading++;
      const idCustom = JSON.parse(localStorage.getItem("idCustomer"));
      const data = {userId: idCustom, sizeId: sizeId, quantity: value}
      await this.addItemToCart(data)
      this.isLoading--;
    },
    addCart() {
      this.countCart++;
    },
    //PATCH
    async updateCart(data, customerId) {
      await savingServices.updateCartCustomer(data, customerId);
    },
    //DELETE
    async removeCart(cartId) {
      this.isLoading++;
      const idCustom = JSON.parse(localStorage.getItem("idCustomer"));
      // const cartId = await this.fetchCartIdByCustomerId(idCustom);
      await savingServices.deleteCart(cartId);
      this.listCarts = await this.fetchListCustomerCart(idCustom);
      localStorage.setItem("cart", JSON.stringify(this.listCarts));
      this.isLoading--;
    },
    async removeInfoDelivery(customerId) {
      await savingServices.deleteInfoDelivery(customerId);
    },
    async removeOrderDetail(customerId) {
      await savingServices.deleteOrderDetail(customerId);
    },
    //PUT
    async addToCartCustomer(data) {
      await savingServices.addToCart(data);
    },
    async addInfoDeliveryOrderNone(data) {
      await savingServices.infoDeliveryOrderNone(data);
    },
    //POST
    //có id
    async addItemToCustomerCart(data){
      const result = await savingServices.addItemToCart(data);
      // this.listCarts = await this.fetchListCustomerCart(customerId);
      localStorage.setItem("cart", JSON.stringify(this.listCarts));
      return result.statusCode;
    },
    async addInfoDelivery(info) {
      await savingServices.infoDeliveryOrder(info);
    },
    async addAcc(data) {
      await savingServices.addListAcc(data);
    },
    async addCartForAcc(data) {
      await savingServices.addCustomerCart(data);
    },
    async addProductToCustomerCart(product) {
      await savingServices.addProductToCart(product);
    },
    async addOrderDetail(info) {
      await savingServices.addOrder(info);
    },
    async addHasOrder(info, customerId) {
      await savingServices.hasOrder(info, customerId);
    },
    //GET
    async fetchOrderById(customerId) {
      this.getListOrderById =
        (await savingServices.getOrderDetail(customerId)) || [];
    },
    async fetchInfoDelivery(customerId) {
      this.isLoading++;
      const arr = (await savingServices.getInfoDelivery(customerId)) || [];
      this.arrInfo = arr.result;
      this.getListInfo = this.arrInfo|| [];
      this.isLoading--;
    },
    async editAddressUser (data) {
      this.isLoading++;
      const arr = (await savingServices.editInfoDelivery(data));
      this.isLoading--;
      return arr;
    },
    async deleteAddressUser (id) {
      this.isLoading++;
      const arr = (await savingServices.deleteInfoDelivery(id));
      this.isLoading--;
      return arr;
    }, 
    async addAddressUser (data) {
      this.isLoading++;
      const arr = (await savingServices.addInfoDelivery(data));
      this.isLoading--;
      return arr;
    }, 
    async createOrder (data) {
      this.isLoading++;
      const arr = await savingServices.addOrderForUser(data);
      this.isLoading--;
      return arr;
    },
    async fetchListCustomerCart(customerId) {
      this.isLoading++;
      const arr = await savingServices.getCustomerCart(customerId);
      this.getListCart = arr.result;
      this.isLoading--;
    },
    async getListAllOrder() {
      this.isLoading++;
      const arr = await savingServices.getAllOrder();
      this.isLoading--;
      return arr.result;
    },
    // async fetchCartIdByCustomerId(customerId){
    //   this.isLoading++;
    //   const arr = await savingServices.getCartIdByCustomerId(customerId);
    //   console.log("This is.....", arr)
    //   this.isLoading--;
    //   return arr.result[0]?.cartID;
    // },
    // async fetchListAccounts() {
    //   this.getListAcc = await savingServices.getListAccounts() || [];
    // },
    async checkLoginAccount(data){
      // this.isLoading++;
      // const arr = await savingServices.checkLogin(username,password);
      // this.checkLogin = arr.result;
      this.checkLogin = await savingServices.checkLogin(data);
      // this.isLoading--;
    },
    async fetchEachProduct(productId) { 
      this.isLoading++;
      const arr = await savingServices.eachProduct(productId);
      if (arr.statusCode === 200) {
        this.product = arr.result;
        this.isLoading--;
      }
      else {
        console.log("error");
      }
    },
    async fetchListProduct(page) { 
      this.isLoading++;
      const arr = await savingServices.listProducts(this.perPage, page);
      console.log(arr);
      if (arr.statusCode === 200) {
        this.listProducts = arr.result;
        this.isLoading--;
      }
    },
    async fetchApi() {
      this.isLoading++;
      const arr = await savingServices.saving(); //object
      console.log("here.....", arr.result[0]);
      if (arr.statusCode === 200) {
        this.children = arr.result[0]; 
        this.isLoading--;
      }
    },
    async fetchApiGift() {
      this.isLoading++;
      const arr = await savingServices.gift();
      if (arr.statusCode === 200) {
        this.gift = arr.result[0];
        this.isLoading--;
      }
    },
    async fetchFeedback(id) {
      this.isLoading++;
      const arr = await savingServices.feedback(id);
      if (arr.statusCode === 200) {
        this.feedback = arr.result[0];
        this.isLoading--;
      }
      return this.feedback;
    },
    async fetchApiSlide() {
      this.isLoading++;
      const arr = await savingServices.slide();
      console.log("this is slide...", arr.result);
      if (arr.statusCode === 200) {
        this.sections = arr.result;
        console.log("This is errors: ", arr.result);
        this.isLoading--;
      }
    },
    async fetchData() {
      this.isLoading++;
      this.products = await savingServices.product();
      this.isLoading--;
    },
    async fetchApiFooterAbout() {
      this.isLoading++;
      const arr = await savingServices.about();
      console.log("This is footer about...", arr);
      if (arr.statusCode === 200) {
        this.about = arr.result[0];
        this.isLoading--;
      }
    },
    async fetchApiFooterHelp() {
      this.isLoading++;
      const arr = await savingServices.help();
      console.log("This is footer help...", this.help);
      console.log("This is footer about...", arr);
      if (arr.statusCode === 200) {
        this.help = arr.result[0];
        this.isLoading--;
      }
    },
    async fetchApiFooterContact() {
      this.isLoading++;
      const arr = await savingServices.contact();
      console.log("This is footer contact...", arr.result);
      if (arr.statusCode === 200) {
        this.contact = arr.result;
        this.isLoading--;
      }
    },
  },
});
