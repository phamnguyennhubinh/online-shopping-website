import { v4 as uuidv4 } from "uuid";
import db from "../models/index";
import paypal from "paypal-rest-sdk";
const { Op } = require("sequelize");
var querystring = require("qs");
var crypto = require("crypto");
require("dotenv").config();
import moment from "moment";
import localization from "moment/locale/vi";
import { EXCHANGE_RATES } from "../utils/Constants";
import {
  successResponse,
  errorResponse,
  missingRequiredParams,
  notFound,
} from "../utils/ResponseUtils";

moment.updateLocale("vi", localization);
paypal.configure({
  mode: "sandbox",
  client_id:
    "AaeuRt8WCq9SBliEVfEyXXQMosfJD-U9emlCflqe8Blz_KWZ3lnXh1piEMcXuo78MvWj0hBKgLN-FamT",
  client_secret:
    "ENWZDMzk17X3mHFJli7sFlS9RT1Vi_aocaLsrftWZ2tjHtBVFMzr4kPf5_9iIcsbFWsHf95vXVi6EADv",
});

const createOrder = async (data) => {
  try {
    if (!data.addressUserId || !data.typeShipId) {
      return missingRequiredParams("addressUserId and typeShipId");
    }
    const product = await db.Order.create({
      addressUserId: data.addressUserId,
      isPaymentOnline: data.isPaymentOnline,
      statusId: "S3",
      typeShipId: data.typeShipId,
      voucherId: data.voucherId,
      note: data.note,
    });

    // Update orderId for products in shop cart
    const updatedShopCart = data.arrDataShopCart.map((item) => ({
      ...item,
      orderId: product.id,
    }));

    // Add order detail
    await db.OrderDetail.bulkCreate(updatedShopCart);

    // Delete ordered products from the shopping cart
    const shopCartItems = await db.ShopCart.findAll({
      where: { userId: data.userId, statusId: 0 },
    });
    if (shopCartItems.length > 0) {
      await db.ShopCart.destroy({ where: { userId: data.userId } });
      // Update product inventory quantity
      for (const cartItem of updatedShopCart) {
        const productSize = await db.productSize.findByPk(cartItem.productId);
        if (productSize) {
          productSize.stock -= cartItem.quantity;
          await productSize.save();
        }
      }
    }

    // Voucher code used
    if (data.voucherId && data.userId) {
      const voucherUse = await db.VoucherUsed.findOne({
        where: { voucherId: data.voucherId, userId: data.userId },
      });
      if (voucherUse) {
        voucherUse.status = 1;
        await voucherUse.save();
      }
    }
    return successResponse("Order created");
  } catch (error) {
    console.error("Error in create order:", error);
    return errorResponse("Error from server");
  }
};

const getAllOrders = async (data) => {
  try {
    let objectFilter = {
      include: [
        { model: db.TypeShip, as: "typeShipData" },
        { model: db.Voucher, as: "voucherData" },
        { model: db.AllCode, as: "statusOrderData" },
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
      nest: true,
    };

    if (data.limit && data.offset) {
      objectFilter.limit = +data.limit;
      objectFilter.offset = +data.offset;
    }

    if (data.statusId && data.statusId !== "ALL") {
      objectFilter.where = { statusId: data.statusId };
    }

    let { rows, count } = await db.Order.findAndCountAll(objectFilter);

    if (rows.length === 0) {
      return {
        result: [],
        errCode: 0,
        errors: ["No orders found!"],
      };
    }

    for (let i = 0; i < rows.length; i++) {
      let [addressUser, shipper] = await Promise.all([
        db.AddressUser.findOne({ where: { id: rows[i].addressUserId } }),
        db.User.findOne({ where: { id: rows[i].shipperId } }),
      ]);

      if (addressUser) {
        let user = await db.User.findOne({ where: { id: addressUser.userId } });
        rows[i].userData = user;
        rows[i].addressUser = addressUser;
        rows[i].shipperData = shipper;
      }
    }

    return {
      result: rows,
      errCode: 0,
      errors: ["Retrieved all order successfully!"],
    };
  } catch (error) {
    console.error("Error in get all order:", error);
    return errorResponse("Error from server");
  }
};

const getOrderById = async (id) => {
  try {
    if (!id) {
      return missingRequiredParams("Id");
    }

    const processImage = async (link) => {
      return link;
    };

    const order = await db.Order.findOne({
      where: { id: id },
      include: [
        { model: db.TypeShip, as: "typeShipData" },
        { model: db.Voucher, as: "voucherData" },
        { model: db.AllCode, as: "statusOrderData" },
      ],
      raw: true,
      nest: true,
    });

    if (!order) {
      return notFound(`Order with id ${id}`);
    }
    const addressUser = await db.AddressUser.findOne({
      where: { id: order.addressUserId },
    });
    if (!addressUser) {
      return notFound(`addressUser for order  with id ${addressUser.id}`);
    }
    const user = await db.User.findOne({
      where: { id: addressUser.userId },
      attributes: { exclude: ["password", "image"] },
      raw: true,
      nest: true,
    });
    if (!user) {
      return notFound(`User for addressUser with id ${addressUser.id}.`);
    }
    if (order.image) {
      order.image = await processImage(order.image);
    }
    order.voucherData.typeVoucherOfVoucherData = await db.TypeVoucher.findOne({
      where: { id: order.voucherData.typeVoucherId },
    });
    const orderDetail = await db.OrderDetail.findAll({
      where: { orderId: id },
    });
    for (let i = 0; i < orderDetail.length; i++) {
      const productSize = await db.ProductSize.findOne({
        where: { id: orderDetail[i].productId },
        include: [{ model: db.AllCode, as: "productSizeData" }],
        raw: true,
        nest: true,
      });
      orderDetail[i].productSize = productSize;
      orderDetail[i].productDetail = await db.ProductDetail.findOne({
        where: { id: productSize.productDetailId },
      });
      orderDetail[i].product = await db.Product.findOne({
        where: { id: orderDetail[i].productDetail.productId },
      });
      const productImages = await db.ProductImage.findAll({
        where: { productDetailId: orderDetail[i].productDetail.id },
      });
      for (let j = 0; j < productImages.length; j++) {
        if (productImages[j].image) {
          productImages[j].image = await processImage(productImages[j].image);
        }
      }
      orderDetail[i].productImage = productImages;
    }
    order.orderDetail = orderDetail;
    order.addressUser = addressUser;
    order.userData = user;
    return {
      result: [order],
      errCode: 200,
      errors: [`Retrieved order ${id} successfully!`],
    };
  } catch (error) {
    return errorResponse(error.message);
  }
};

const updateStatusOrder = async (data) => {
  try {
    const { id, statusId, dataOrder } = data;

    if (!id || !statusId) {
      return missingRequiredParams("Id, statusId are");
    }

    const [updatedRowsCount, updatedRows] = await db.Order.update(
      { statusId: statusId },
      { where: { id: id } }
    );

    if (updatedRowsCount === 0) {
      return notFound(`Order with id ${id}`);
    }
    console.log("Updated rows:", updatedRows);
    if (
      statusId === "S7" &&
      dataOrder &&
      dataOrder.orderDetail &&
      dataOrder.orderDetail.length > 0
    ) {
      for (let i = 0; i < dataOrder.orderDetail.length; i++) {
        let productSize = await db.ProductSize.findOne({
          where: { id: dataOrder.orderDetail[i].productSize.id },
        });

        if (!productSize) {
          return notFound(
            `ProductSize for id ${dataOrder.orderDetail[i].productSize.id}.`
          );
        }
        productSize.stock += dataOrder.orderDetail[i].quantity;
        await productSize.save();
      }
    }
    return successResponse("Updated status order");
  } catch (error) {
    return errorResponse(error.message);
  }
};

const getAllOrdersByUser = async (userId) => {
  try {
    if (!userId) {
      return missingRequiredParams("userId");
    }
    const addressUsers = await db.AddressUser.findAll({
      where: { userId: userId },
    });
    const result = [];
    for (let i = 0; i < addressUsers.length; i++) {
      const orders = await db.Order.findAll({
        where: { addressUserId: addressUsers[i].id },
        include: [
          { model: db.TypeShip, as: "typeShipData" },
          { model: db.Voucher, as: "voucherData" },
          { model: db.AllCode, as: "statusOrderData" },
        ],
        raw: true,
        nest: true,
      });
      for (let j = 0; j < orders.length; j++) {
        orders[j].voucherData.typeVoucherOfVoucherData =
          await db.TypeVoucher.findOne({
            where: { id: orders[j].voucherData.typeVoucherId },
          });

        const orderDetail = await db.OrderDetail.findAll({
          where: { orderId: orders[j].id },
        });
        for (let k = 0; k < orderDetail.length; k++) {
          const productSize = await db.ProductSize.findOne({
            where: { id: orderDetail[k].productId },
            include: [{ model: db.AllCode, as: "productSizeData" }],
            raw: true,
            nest: true,
          });

          orderDetail[k].productSize = productSize;
          orderDetail[k].productDetail = await db.ProductDetail.findOne({
            where: { id: productSize.productDetailId },
          });
          orderDetail[k].product = await db.Product.findOne({
            where: { id: orderDetail[k].productDetail.productId },
          });

          const productImages = await db.ProductImage.findAll({
            where: { productDetailId: orderDetail[k].productDetail.id },
          });

          orderDetail[k].productImage = productImages;
        }

        orders[j].orderDetail = orderDetail;
      }

      result.push({ addressUser: addressUsers[i], orders: orders });
    }

    return {
      result: result,
      errCode: 0,
      errors: ["Retrieved all orders by user successfully!"],
    };
  } catch (error) {
    console.error("Errors", error);
    return errorResponse(error.message);
  }
};

// const paymentOrder = async (data) => {
//   try {
//     if (!data) {
//       return missingRequiredParams("data");
//     }

//     let listItem = [];
//     let totalPriceProduct = 0;
//     const exchangeRate = EXCHANGE_RATES.VND_to_USD;

//     for (const resultItem of data.result) {
//       const productSize = await db.ProductSize.findOne({
//         where: { id: resultItem.productId },
//         include: [{ model: db.AllCode, as: "productSizeData" }],
//         raw: true,
//         nest: true,
//       });

//       if (!productSize) {
//         continue;
//       }

//       const productDetail = await db.ProductDetail.findOne({
//         where: { id: productSize.productDetailId },
//       });

//       if (!productDetail) {
//         continue;
//       }

//       const product = await db.Product.findOne({
//         where: { id: productDetail.productId },
//       });

//       // Convert product price from VND to USD
//       const realPriceUSD = parseFloat(
//         (resultItem.realPrice / exchangeRate).toFixed(2)
//       );

//       if (isNaN(realPriceUSD) || realPriceUSD <= 0) {
//         throw new Error(`Invalid product price: ${resultItem.realPrice}`);
//       }

//       listItem.push({
//         name: `${product.name} | ${productDetail.color} | ${productSize.productSizeData.value}`,
//         sku: `${resultItem.productId}`,
//         price: `${realPriceUSD}`,
//         currency: "USD",
//         quantity: resultItem.quantity,
//       });

//       // Calculate the total value of the product
//       totalPriceProduct += realPriceUSD * resultItem.quantity;
//     }

//     // Calculate shipping fees and voucher discounts
//     const shippingAndVoucherPriceUSD = parseFloat(
//       (data.total - totalPriceProduct) / exchangeRate
//     ).toFixed(2);

//     if (isNaN(shippingAndVoucherPriceUSD) || shippingAndVoucherPriceUSD <= 0) {
//       throw new Error(`Invalid shipping and voucher price: ${data.total}`);
//     }

//     listItem.push({
//       name: "Phi ship + Voucher",
//       sku: "1",
//       price: `${shippingAndVoucherPriceUSD}`,
//       currency: "USD",
//       quantity: 1,
//     });

//     // Calculate the total amount
//     const totalUSD = data.total
//       ? parseFloat(data.total / exchangeRate).toFixed(2)
//       : parseFloat(
//           (totalPriceProduct + parseFloat(shippingAndVoucherPriceUSD)) /
//             exchangeRate
//         ).toFixed(2);

//     const createPaymentJson = {
//       intent: "sale",
//       payer: {
//         payment_method: "paypal",
//       },
//       redirect_urls: {
//         return_url: `http://localhost:8000/payment/success`,
//         cancel_url: "http://localhost:8000/payment/cancel",
//       },
//       transactions: [
//         {
//           item_list: {
//             items: listItem,
//           },
//           amount: {
//             currency: "USD",
//             total: totalUSD,
//           },
//           description: "This is the payment description.",
//         },
//       ],
//     };

//     const payment = await new Promise((resolve, reject) => {
//       paypal.payment.create(createPaymentJson, (error, payment) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(payment);
//         }
//       });
//     });

//     return {
//       result: [{ link: payment.links[1].href }],
//       statusCode: 200,
//       errors: ["success"],
//     };
//   } catch (error) {
//     console.error("Error:", error);
//     return errorResponse(error.message);
//   }
// };

const paymentOrder = async (data) => {
  try {
    if (!data || !data.result || !data.total) {
      return missingRequiredParams("data, result, and total");
    }

    let listItem = [];
    let totalPriceProduct = 0;
    const exchangeRate = EXCHANGE_RATES.VND_to_USD;

    for (const resultItem of data.result) {
      const productSize = await db.ProductSize.findOne({
        where: { id: resultItem.productId },
        include: [{ model: db.AllCode, as: "productSizeData" }],
        raw: true,
        nest: true,
      });

      if (!productSize) {
        continue;
      }

      const productDetail = await db.ProductDetail.findOne({
        where: { id: productSize.productDetailId },
      });

      if (!productDetail) {
        continue;
      }

      const product = await db.Product.findOne({
        where: { id: productDetail.productId },
      });

      // Convert product price from VND to USD
      const realPriceUSD = parseFloat(
        (resultItem.realPrice / exchangeRate).toFixed(2)
      );

      if (isNaN(realPriceUSD) || realPriceUSD <= 0) {
        console.error(`Invalid product price: ${resultItem.realPrice}`);
        continue; // Skip this product and continue to the next one
      }

      listItem.push({
        name: `${product.name} | ${productDetail.color} | ${productSize.productSizeData.value}`,
        sku: `${resultItem.productId}`,
        price: `${realPriceUSD}`,
        currency: "USD",
        quantity: resultItem.quantity,
      });

      // Calculate the total value of the product
      totalPriceProduct += realPriceUSD * resultItem.quantity;
    }

    // Calculate shipping fees and voucher discounts
    const shippingAndVoucherPriceUSD = parseFloat(
      (data.total - totalPriceProduct) / exchangeRate
    ).toFixed(2);

    if (isNaN(shippingAndVoucherPriceUSD) || shippingAndVoucherPriceUSD < 0) {
      console.error(`Invalid shipping and voucher price: ${data.total}`);
      return {
        result: [],
        statusCode: 500,
        errors: [`Invalid shipping and voucher price: ${data.total}`],
      };
    }

    listItem.push({
      name: "Phi ship + Voucher",
      sku: "1",
      price: `${shippingAndVoucherPriceUSD}`,
      currency: "USD",
      quantity: 1,
    });

    // Calculate the total amount
    const totalUSD = data.total
      ? parseFloat(data.total / exchangeRate).toFixed(2)
      : parseFloat(
          (totalPriceProduct + parseFloat(shippingAndVoucherPriceUSD)) /
            exchangeRate
        ).toFixed(2);

    const createPaymentJson = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `http://localhost:8000/payment/success`,
        cancel_url: "http://localhost:8000/payment/cancel",
      },
      transactions: [
        {
          item_list: {
            items: listItem,
          },
          amount: {
            currency: "USD",
            total: totalUSD,
          },
          description: "This is the payment description.",
        },
      ],
    };

    const payment = await new Promise((resolve, reject) => {
      paypal.payment.create(createPaymentJson, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          resolve(payment);
        }
      });
    });

    return {
      result: [{ link: payment.links[1].href }],
      statusCode: 200,
      errors: ["success"],
    };
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(error.message);
  }
};

const confirmOrder = async (data) => {
  try {
    if (!data.shipperId || !data.orderId || !data.statusId) {
      return errorResponse("Missing required parameter !");
    }

    const Order = await db.Order.findOne({
      where: { id: data.orderId },
      raw: false,
    });

    Order.shipperId = data.shipperId;
    Order.statusId = data.statusId;
    await Order.save();

    return successResponse("ok");
  } catch (error) {
    return errorResponse(error);
  }
};

const paymentOrderSuccess = async (data) => {
  try {
    if (!data.PayerID || !data.paymentId || !data.token) {
      return {
        errCode: 1,
        errMessage: "Missing required parameter !",
      };
    }

    const execute_payment_json = {
      payer_id: data.PayerID,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: data.total,
          },
        },
      ],
    };

    const paymentId = data.paymentId;

    const payment = await new Promise((resolve, reject) => {
      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        (error, payment) => {
          if (error) {
            resolve({
              errCode: 0,
              errMessage: error,
            });
          } else {
            resolve(payment);
          }
        }
      );
    });

    const product = await db.Order.create({
      addressUserId: data.addressUserId,
      isPaymentOnline: data.isPaymentOnline,
      statusId: "S3",
      typeShipId: data.typeShipId,
      voucherId: data.voucherId,
      note: data.note,
    });

    data.arrDataShopCart = data.arrDataShopCart.map((item) => {
      item.orderId = product.dataValues.id;
      return item;
    });

    await db.OrderDetail.bulkCreate(data.arrDataShopCart);

    const res = await db.ShopCart.findOne({
      where: { userId: data.userId, statusId: 0 },
    });

    if (res) {
      await db.ShopCart.destroy({
        where: { userId: data.userId },
      });
      for (let i = 0; i < data.arrDataShopCart.length; i++) {
        const productSize = await db.ProductSize.findOne({
          where: { id: data.arrDataShopCart[i].productId },
          raw: false,
        });
        productSize.stock -= data.arrDataShopCart[i].quantity;
        await productSize.save();
      }
    }

    if (data.voucherId && data.userId) {
      const voucherUses = await db.VoucherUsed.findOne({
        where: { voucherId: data.voucherId, userId: data.userId },
        raw: false,
      });
      voucherUses.status = 1;
      await voucherUses.save();
    }

    return {
      result: [],
      errCode: 0,
      errors: ["Success"],
    };
  } catch (error) {
    throw error;
  }
};

let paymentOrderVNPay = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      var ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      var tmnCode = process.env.VNP_TMNCODE;
      var secretKey = process.env.VNP_HASHSECRET;
      var vnpUrl = process.env.VNP_URL;
      var returnUrl = process.env.VNP_RETURNURL;

      var createDate = process.env.DATE_VNPAYMENT;
      var orderId = uuidv4();

      console.log("createDate", createDate);
      console.log("orderId", orderId);
      var amount = req.body.amount;
      var bankCode = req.body.bankCode;

      var orderInfo = req.body.orderDescription;
      var orderType = req.body.orderType;
      var locale = req.body.language;
      if (locale === null || locale === "") {
        locale = "vn";
      }
      var currCode = "VND";
      var vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      // vnp_Params['vnp_Merchant'] = ''
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = orderInfo;
      vnp_Params["vnp_OrderType"] = orderType;
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }

      vnp_Params = sortObject(vnp_Params);

      var signData = querystring.stringify(vnp_Params, { encode: false });

      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;

      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
      console.log(vnpUrl);
      resolve({
        errCode: 200,
        link: vnpUrl,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let confirmOrderVNPay = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      var vnp_Params = data;

      var secureHash = vnp_Params["vnp_SecureHash"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = sortObject(vnp_Params);

      var tmnCode = process.env.VNP_TMNCODE;
      var secretKey = process.env.VNP_HASHSECRET;

      var signData = querystring.stringify(vnp_Params, { encode: false });

      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

      if (secureHash === signed) {
        resolve({
          errCode: 0,
          errMessage: "Success",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "failed",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let paymentOrderVNPaySuccess = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product = await db.OrderProduct.create({
        addressUserId: data.addressUserId,
        isPaymentOnline: data.isPaymentOnline,
        statusId: "S3",
        typeShipId: data.typeShipId,
        voucherId: data.voucherId,
        note: data.note,
      });

      data.arrDataShopCart = data.arrDataShopCart.map((item, index) => {
        item.orderId = product.dataValues.id;
        return item;
      });

      await db.OrderDetail.bulkCreate(data.arrDataShopCart);
      let res = await db.ShopCart.findOne({
        where: { userId: data.userId, statusId: 0 },
      });
      if (res) {
        await db.ShopCart.destroy({
          where: { userId: data.userId },
        });
        for (let i = 0; i < data.arrDataShopCart.length; i++) {
          let productDetailSize = await db.ProductDetailSize.findOne({
            where: { id: data.arrDataShopCart[i].productId },
            raw: false,
          });
          productDetailSize.stock =
            productDetailSize.stock - data.arrDataShopCart[i].quantity;
          await productDetailSize.save();
        }
      }
      if (data.voucherId && data.userId) {
        let voucherUses = await db.VoucherUsed.findOne({
          where: {
            voucherId: data.voucherId,
            userId: data.userId,
          },
          raw: false,
        });
        voucherUses.status = 1;
        await voucherUses.save();
      }
      resolve({
        errCode: 0,
        errMessage: "ok",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getAllOrdersByShipper = async (shipperId, status) => {
  try {
    if (!shipperId) {
      return errorResponse("shipperId is required!");
    }
    let objectFilter = {
      include: [
        { model: db.TypeShip, as: "typeShipData" },
        { model: db.Voucher, as: "voucherData" },
        { model: db.AllCode, as: "statusOrderData" },
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
      nest: true,
      where: { shipperId: shipperId },
    };
    if (status === "working") {
      objectFilter.where = { ...objectFilter.where, statusId: "S5" };
    } else if (status === "done") {
      objectFilter.where = { ...objectFilter.where, statusId: "S6" };
    }
    const orders = await db.Order.findAll(objectFilter);
    for (let i = 0; i < orders.length; i++) {
      const addressUser = await db.AddressUser.findOne({
        where: { id: orders[i].addressUserId },
      });
      if (addressUser) {
        const user = await db.User.findOne({
          where: { id: addressUser.userId },
        });
        orders[i].userData = user;
        orders[i].addressUser = addressUser;
      }
    }
    return {
      result: orders,
      errCode: 200,
      errors: ["Retrieved all orders by shipper successfully!"],
    };
  } catch (error) {
    return errorResponse(error.message);
  }
};
export default {
  createOrder,
  getAllOrders,
  getOrderById,
  updateStatusOrder,
  getAllOrdersByUser,
  paymentOrder,
  confirmOrder,
  paymentOrderSuccess,
  paymentOrderVNPay,
  confirmOrderVNPay,
  paymentOrderVNPaySuccess,
  getAllOrdersByShipper,
};
