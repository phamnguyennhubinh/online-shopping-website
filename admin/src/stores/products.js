import { defineStore } from 'pinia';
import { AxiosInstance } from '@/helpers/request';
import { 
  GET_ALL_PRODUCT,
  GET_PRODUCT_BY_ID,
  DELETE_PRODUCT_BY_ID,
  UPDATE_PRODUCT_BY_ID,
  CREATE_PRODUCT
} from '@/helpers/api'
import { message } from 'ant-design-vue';
import router from '@/router';

export const useProducts = defineStore({
  id: 'products',
  state: () => ({
    listProducts: null,
    product: {},
  }),
  actions: {
    async getAllProducts() {
      try {
        const res = await AxiosInstance.get(GET_ALL_PRODUCT);
        this.listProducts = res?.data?.result;
        return res?.data?.result
      } catch (error) {
        console.log(error);
      }
    },

    async getProductById(id) {
        try {
            const res = await AxiosInstance.get(GET_PRODUCT_BY_ID(id));
            this.product = res.data
            return res.data.result
        } catch (error) {
          console.log(error);
        }
    },

    async deleteProduct(id, redirectRouter, onSuccess) {
      try {
          await AxiosInstance.delete(DELETE_PRODUCT_BY_ID(id));
          if (onSuccess && typeof onSuccess === 'function') {
            onSuccess();
          }
          redirectRouter && router.push(redirectRouter);
          message.success('Delete successful product !');
      } catch (error) {
        console.log(error);
      }
    },

    async updateProduct(body, onSuccess) {
      try {
        await AxiosInstance.put(UPDATE_PRODUCT_BY_ID, body, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
        message.success('Update successful product !');
      } catch (error) {
        console.log(error)
        
      }
    },

    async createProduct(body, onSuccess) {
      try {
        await AxiosInstance.post(CREATE_PRODUCT, body, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
        message.success('Create successful product !');
      } catch (error) {
        console.log(error)
      }
    }
  }
});
