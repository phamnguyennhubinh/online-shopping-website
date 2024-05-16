import { defineStore } from 'pinia';
import { 
  GET_COLOR,
  GET_BRAND,
  CREATE_CODE,
  UPDATE_CODE,
  DELETE_CODE,
  GET_SIZE
} from '@/helpers/api'
import { AxiosInstance } from '@/helpers/request';
import { message } from 'ant-design-vue';
import router from '@/router';

export const useSettings = defineStore({
  id: 'settings',
  state: () => ({
    listCode: [],
    listBrand: [],
    listSize: [],
  }),
  actions: {
    async getListColor() {
      try {
        const res = await AxiosInstance.get(GET_COLOR);
        this.listBrand = res.data.result;
        return res?.data?.result[0] ?? []
      } catch (error) {
        console.log(error);
      }
    },
    async getListBrand() {
      try {
        const res = await AxiosInstance.get(GET_BRAND);
        this.listCode = res.data.result
        return res?.data?.result[0] ?? []
      } catch (error) {
        console.log(error);
      }
    },
    async getListSize() {
      try {
        const res = await AxiosInstance.get(GET_SIZE);
        this.listSize = res.data.result
        return res?.data?.result[0] ?? []
      } catch (error) {
        console.log(error);
      }
    },
    async createColor(body) {
      try {
        const res = await AxiosInstance.post(CREATE_CODE, body);
        message.success('Create successful !');
        return res.data.result
      } catch (error) {
        console.log(error);
      }
    },
    async updateCode(body) {
      try {
        const res = await AxiosInstance.put(UPDATE_CODE, body);
        message.success('Update successful !');
        return res.data.result
      } catch (error) {
        console.log(error);
      }
    },
    async deleteCode(id) {
      try {
        const res = await AxiosInstance.delete(DELETE_CODE(id));
        message.success('Delete successful !');
        return res.data.result
      } catch (error) {
        console.log(error);
      }
    },
  }
});
