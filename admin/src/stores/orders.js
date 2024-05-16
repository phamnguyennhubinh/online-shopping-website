import { defineStore } from 'pinia';

import { AxiosInstance } from '@/helpers/request';
import router from '@/router';

export const useOrders = defineStore({
  id: 'orders',
  state: () => ({
    listOrders: [],
    order: {},
  }),
  actions: {
    async getAllOrders() {
      try {
        const res = await AxiosInstance.get(`/orders`);
        this.listOrders = res.data
      } catch (error) {
        console.log(error);
      }
    },

    async getOrdersById(id) {
        try {
            const res = await AxiosInstance.get(`/order/${id}`);
            this.product = res.data
        } catch (error) {
          console.log(error);
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

    async updateOrder(id, body) {
        try {
            await AxiosInstance.put(`/order/${id}`, body);
            router.push(redirectRouter);
        } catch (error) {
          console.log(error);
        }
      }
  }
});
