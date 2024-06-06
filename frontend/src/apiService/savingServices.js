import * as request from "@/utils/request";

//get type ship from lasted backend
export const type_ship = async () => {
  try {
    const res = await request.get_from_be("api/type-ship");
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const get_type_ship_by_id = async (id) => {
  try {
    const res = await request.get_from_be(`api/type-ship/get-by-id?id=${id}`);
    return res;
  } catch (error) {
    console.log(error);
  }
}

export const update_type_ship = async () => {
  try {
    const res = await request.get_from_be("api/type-ship");
    return res;
  } catch (error) {
    console.log(error);
  }
}

//get list cart by userID
export const get = async (data) => {
  try {
    const res = await request.post_from_be("api/user/login", data);
    console.log("is undefined: ", res);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log('my error', error);
  }
};

//get products
export const listProducts = async () => {
  try {
    //  const res = await request.get(`products?_limit=${perPage}&_page=${page}`);
    const res = await request.get_from_be(
      `api/product/get-all-user`
    );
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

//fixed
export const eachProduct = async (id) => {
  try {
    const res = await request.get_from_be(`api/product/get-by-id?id=${id}`);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

//fixed
export const getCustomerCart = async (customerId) => {
  try {
    const res = await request.get_from_be(`api/shop-cart/by-user-id?userId=${customerId}`);
    // console.log("is undefined: ", res);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

// ADD TO CART
export const addItemToCart = async (data) => {
  try {
const res = await request.post_from_be("api/shop-cart/add", data);
  if(res.data) {
    return res.data;
  }
  return res;
  } catch (error) {
    console.log(error);
  }
}

export const deleteCart = async (cartId) => {
  try {
    const res = await request.delete_from_be(`api/shop-cart/delete?id=${cartId}`);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

//PATCH
export const updateCartCustomer = async (data) => {
  try {
    const res = await request.put_from_be(`api/shop-cart/update`, data);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

///Order from backend
export const getOrder = async (cartId) => {
  try {
    const res = await request.get_from_be(`api/shop-cart/delete?id=${cartId}`);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const getAllOrder = async () => {
  try {
    const res = await request.get_from_be(`/api/order`);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const feedback = async (id) =>{
  const res = await request.get(`setting/feedback/${id}`);
  const resultObject = JSON.parse(res);
  return resultObject;
};

//Nếu trong object cần nhận từ bên ngoài vào thì để 2 tham số vào
//ở sync()
//fixed
export const gift = async () => {
  try {
    const res = await request.get("setting/sections/5");
    const resultObject = JSON.parse(res);
    return resultObject;
  } catch (error) {
    console.log(error);
  }
};

export const product = async () => {
  try {
    const res = await request.get("/product/list");
    return res;
  } catch (error) {
    console.log(error);
  }
};

//getcartid by customerid
// export const getCartIdByCustomerId = async (customerId) => {
//   const res = await request.get(`cart/getCartId/${customerId}`);
//   const resultObject = JSON.parse(res);
//   return resultObject;
// };


//new add - FIXED FROM LASTEST BACKEND
export const checkLogin = async (data) => {
  try {
    const res = await request.post_from_be("api/user/login", data);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log('my error', error);
  }
};

export const getInfoDelivery = async (customerId) => {
  try {
    const res = await request.get_from_be(`api/address-user?userId=${customerId}`);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const editInfoDelivery = async (data) => {
  try {
    const res = await request.put_from_be("api/address-user/edit", data);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const addInfoDelivery = async (data) => {
  try {
    const res = await request.post_from_be("api/address-user/create", data);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const removeInfoDelivery = async (id) => {
  try {
    const res = await request.delete_from_be(`api/address-user/delete?id=${id}`);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const addOrderForUser = async (data) => {
  try {
    const res = await request.post_from_be("api/order/create", data);
    if(res.data) {
      return res.data;
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};



export const getOrderDetail = async (customerId) => {
  try {
    const res = await request.get(`listOrders/${customerId}`);
    return res;
  } catch (error) {
    console.log(error);
  }
};
//////POST
//Nếu KH chưa có trong addOrder
export const addOrder = async (info) => {
  try {
    const res = await request.post("listOrders", info);
    return res;
  } catch (error) {
    console.log(error);
  }
};
//Nếu KH đã có trong Order
export const hasOrder = async (info, customerId) => {
  try {
    const res = await request.post(`listOrders/${customerId}`, info);
    return res;
  } catch (error) {
    console.log(error);
  }
};
//FIXED FROM LASTEST BACKEND
export const addListAcc = async (newAccountData) => {
  try {
    const res = await request.post_from_be("api/user/register", newAccountData);
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const addCustomerCart = async (newCart) => {
  try {
    const res = await request.post("customerCarts", newCart);
    console.log(res);
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const addProductToCart = async (product) => {
  try {
    const res = await request.post("customerCarts", product);
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const infoDeliveryOrder = async (info) => {
  try {
    const tempp = JSON.parse(localStorage.getItem("idCustomer"));
    const res = await request.post(`infoDelivery/${tempp}`, info);
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const infoDeliveryOrderNone = async (info) => {
  try {
    // const tempp = JSON.parse(localStorage.getItem("idCustomer"));
    const res = await request.post("infoDelivery", info);
    return res;
  } catch (error) {
    console.log(error);
  }
};
//PUT
export const addToCart = async (data) => {
  try {
    const tempp = JSON.parse(localStorage.getItem("idCustomer"));
    const res = await request.put(`customerCarts/${tempp}`, data);
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const deleteInfoDelivery = async (customerId) => {
  try {
    const res = await request.remove(`infoDelivery/${customerId}`);
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const deleteOrderDetail = async (customerId) => {
  try {
    const res = await request.remove(`listOrders/${customerId}`);
    return res;
  } catch (error) {
    console.log(error);
  }
};
