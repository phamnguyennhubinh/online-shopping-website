// products
export const GET_ALL_PRODUCT = '/product/get-all-admin'
export const GET_PRODUCT_BY_ID = (id) => `/product/get-by-id?id=${id}`;
export const DELETE_PRODUCT_BY_ID = (id) => `/product/detail/delete?id=${id}`;
export const UPDATE_PRODUCT_BY_ID = '/product/update';
export const CREATE_PRODUCT = '/product/create'

// orders
export const GET_ALL_ORDER = '/order';
export const GET_ORDER_BY_ID = (id) => `/order/get-by-id?id=${id}`;
export const DELETE_ORDER_BY_ID = (id) => `/order/delete/${id}`;
export const UPDATE_ORDER_BY_ID = (id) => `/order/update/${id}`;
export const CREATE_ORDER = '/orders/add'

// users
export const GET_ALL_USER = '/users'
export const GET_USER_BY_ID = (id) => `/user/${id}`;
export const DELETE_USER_BY_ID = (id) => `/user/delete/${id}`;
export const UPDATE_USER_BY_ID = (id) => `/user/update/${id}`;

// accounts
export const LOGIN = '/user/login'
export const REGISTER = '/user/register'

// customers
export const GET_ALL_CUSTOMERS = '/customers'
export const GET_CUSTOMERS_BY_ID = (id) => `/customer/${id}`;
export const DELETE_CUSTOMERS_BY_ID = (id) => `/customer/delete/${id}`;
export const UPDATE_CUSTOMERS_BY_ID = (id) => `/customer/update/${id}`;

// settings
export const GET_COLOR = '/code?type=color'
export const GET_BRAND = '/code?type=brand'
export const GET_SIZE = '/code?type=size'
export const CREATE_CODE = '/code/create'
export const UPDATE_CODE = '/code/update'
export const DELETE_CODE = (id) => `/code/delete?id=${id}`
export const CREATE_TYPE_SHIP = '/type-ship/create'
export const UPDATE_TYPE_SHIP = '/type-ship/update'
export const GET_TYPE_SHIP = '/type-ship'
export const DELETE_TYPE_SHIP = '/type-ship/delete'

// cart
export const GET_ALL_CART = '/shop-cart/add'
export const GET_CART_BY_USER_ID = (id) => `/shop-cart/by-user-id?userId=${id}`
export const DELETE_CART = (id) => `/shop-cart/delete?id=${id}`