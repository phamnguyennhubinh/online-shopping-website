import axios from "axios";
import { notification } from "ant-design-vue";

const ACCESS_TOKEN = "access_token";
const baseURL = 'http://127.0.0.1:8888/api'
export const AxiosInstance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const isServer = () => {
    return typeof window === "undefined";
  };

  AxiosInstance.interceptors.request.use((config) => {
    const newAccessToken = localStorage.getItem(ACCESS_TOKEN);
    if (newAccessToken) {
      config.headers.Authorization = `Bearer ${newAccessToken}`;
    }
    return config;
  });
  
  AxiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // check conditions to refresh token
  
      const errorResponse = error.response?.data;
      if (
        errorResponse?.status === 403 &&
        errorResponse?.message === "PERMISSION_DENIED"
      ) {
        notification.error({
          message: "Permission denied.",
          key: "permission_denied",
        });
        window.location.href = '/'
        return Promise.reject(error);
      }
      if (
        error.response?.status === 401 &&
        error?.response?.data?.error === "Unauthorized" &&
        !isServer()
      ) {
        localStorage.removeItem(ACCESS_TOKEN);
        window.location.href = '/'
        return error;
      }
      return Promise.reject(error);
    }
  );