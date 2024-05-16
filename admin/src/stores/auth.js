import { defineStore } from 'pinia';

import { AxiosInstance } from '@/helpers/request';
import router from '@/router';
import { 
  LOGIN,
  REGISTER
} from '@/helpers/api'

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
        const accessToken = res.data?.result?.[0]?.accessToken;
        this.access_token = accessToken
        localStorage.setItem('access_token', JSON.stringify(accessToken));
        router.push('/');
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
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
});
