import { defineStore } from 'pinia';

import { AxiosInstance } from '@/helpers/request';
import router from '@/router';
import { message } from 'ant-design-vue';

export const useOrders = defineStore({
  id: 'orders',
  state: () => ({
    listOrders: [],
    order: {},
  }),
  actions: {
    async getAllOrders() {
      try {
        const res = await AxiosInstance.get(`/order`);
        this.listOrders = res.data.result
        return res.data.result
      } catch (error) {
        console.log(error);
      }
    },

    async getOrdersById(id) {
      try {
        // Gọi hai API song song
        const [res, resOrder] = await Promise.all([
          AxiosInstance.get(`/order/get-by-id?id=${id}`),
          AxiosInstance.get(`/order`)
        ]);
    
        const orderData = res.data.result;
        const resultOrderList = resOrder.data.result;
        const currentItem = resultOrderList[id];
        if (currentItem) {
          const data = {
            ...currentItem,
            addressUser: orderData.addressUser,
            isPaymentOnline: orderData.isPaymentOnline,
            note: orderData.note,
            status: orderData.status,
            typeShip: orderData.typeShip,
          };
          return data;
        }
        return orderData;
      } catch (error) {
        console.log(error);
        return null;
      }
    },

    async deleteOrder(id, redirectRouter = '/') {
      try {
          await AxiosInstance.delete(`/order/${id}`);
          router.push(redirectRouter);
      } catch (error) {
        console.log(error);
      }
    },

    async updateOrder(body) {
        try {
            await AxiosInstance.put(`/order/update-status`, body);
            message.success('Update successful !');
        } catch (error) {
          console.log(error);
        }
      }
  }
});
