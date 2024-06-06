import { defineStore } from 'pinia';

import { AxiosInstance } from '@/helpers/request';
import router from '@/router';
import { 
  LOGIN,
  REGISTER
} from '@/helpers/api'
import { message } from "ant-design-vue";

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || null),
    access_token: localStorage.getItem('access_token') ?? null,
  }),
  actions: {
    async login(body) {
      try {
        const res = await AxiosInstance.post(LOGIN, body);
        console.log("hello", res)
        if(res?.data?.statusCode === 200)
          {
            const accessToken = res.data?.result?.[0]?.accessToken;
        this.access_token = accessToken
        localStorage.setItem('access_token', JSON.stringify(accessToken));
        router.push('/');
        message.success("Đăng nhập thành công")
          }
          else {
            const response = res.data?.errors[0]
            message.error(response)
          }
        
      } catch (error) {
        console.log(error);
      }
    },

    logout() {
      this.access_token = null;
      localStorage.removeItem('access_token');
      router.push('/account/login');
    },

    async register(body, onSuccess) {
      try {
        await AxiosInstance.post(REGISTER, body);
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        message.success("Đăng ký thành công")
          router.push('/login')
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
});
