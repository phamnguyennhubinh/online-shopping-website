import { defineStore } from 'pinia';

import { AxiosInstance } from '@/helpers/request';
import router from '@/router';
import { 
  GET_ALL_CUSTOMERS,
  GET_CUSTOMERS_BY_ID,
  DELETE_CUSTOMERS_BY_ID,
  UPDATE_CUSTOMERS_BY_ID,
} from '@/helpers/api'


export const useCustomers = defineStore({
  id: 'customers',
  state: () => ({
    listCustomers: [],
    customer: null,
  }),
  actions: {
    async getAllCustomers() {
      try {
        const res = await AxiosInstance.get(GET_ALL_CUSTOMERS);
        this.listOrders = res.data
      } catch (error) {
        console.log(error);
      }
    },

    async getCustomerById(id) {
      try {
        const res = await AxiosInstance.get(GET_CUSTOMERS_BY_ID(id));
        this.customer = res.data
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },

    async deleteCustomer(id, redirectRouter = '/', onSuccess) {
      try {
        await AxiosInstance.delete(DELETE_CUSTOMERS_BY_ID(id));
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
        redirectRouter && router.push(redirectRouter);
      } catch (error) {
        console.log(error);
      }
    },

    async updateCustomer(id, body, onSuccess) {
      try {
        await AxiosInstance.put(UPDATE_CUSTOMERS_BY_ID(id), body);
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
});
