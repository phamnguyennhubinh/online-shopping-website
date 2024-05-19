import axios from "axios";
import { message } from "ant-design-vue";

const getToken = JSON.parse(localStorage.getItem("token"));
const request = axios.create({
  baseURL: "http://localhost:3001/"
});

const req_from_be = axios.create({
  baseURL: "http://localhost:8888/",
  headers: {
    'Authorization': 'Bearer ' + getToken
  }
});

req_from_be.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  const { response } = error;
  if(response.status === 404 || response.status === 401) {
    message.error(response.data?.errors[0]);
    return Promise.reject(response.data);
  }
  return Promise.reject(error);
});

export const get = async (path, options = {}) => {
  try {
    const response = await request.get(path, options);
    return JSON.stringify(response.data);
  } catch (error) {
    console.log("This is error in request: ", error);
  }
};

//for backend
export const get_from_be = async (path, options = {}) => {
  try {
    const response = await req_from_be.get(path, options);
    return response;
  } catch (error) {
    console.log("This is error in request: ", error);
    return error;
  }
};

export const post_from_be = async (path, options = {}) => {
  try {
    const response = await req_from_be.post(path, options);
    return response;
  } catch (error) {
    console.log("This is error in request: ", error);
    return error;
  }
};

export const put_from_be = async (path, options = {}) => {
  try {
    const response = await req_from_be.put(path, options);
    return response;
  } catch (error) {
    console.log("This is error in request: ", error);
    return error;
  }
};

export const delete_from_be = async (path, options = {}) => {
  try {
    const response = await req_from_be.delete(path, options);
    return response;
  } catch (error) {
    console.log("This is error in request: ", error);
    return error;
  }
};

//POST ACCOUNT
export const post = async (path, data = {}, options = {}) => {
  try {
    const response = await request.post(path, data, options);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thực hiện yêu cầu POST:", error);
    throw error;
  }
};

export const patch = async (path, data = {}, options = {}) => {
  try {
    const response = await request.patch(path, { data }, options);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thực hiện yêu cầu PATCH:", error);
    throw error;
  }
};
//PUT CART
export const put = async (path, data = {}, options = {}) => {
  try {
    const response = await request.put(path, data, options);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thực hiện yêu cầu PUT:", error);
    throw error;
  }
};

//DELETE
export const remove = async (path, options = {}) => {
  try {
    const response = await request.delete(path, options);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thực hiện yêu cầu DELETE:", error);
    throw error;
  }
};

export default request;
