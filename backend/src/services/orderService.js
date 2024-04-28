import { v4 as uuidv4 } from "uuid";
import db from "../models/index";
// import paypal from "paypal-rest-sdk";
const { Op } = require("sequelize");
var querystring = require("qs");
var crypto = require("crypto");
// var dateFormat = require("dateformat");
require("dotenv").config();
import moment from "moment";
import localization from "moment/locale/vi";
// import { EXCHANGE_RATES } from "../utils/Constants";
import {
  successResponse,
  errorResponse,
  missingRequiredParams,
  notFound,
} from "../utils/ResponseUtils";

// moment.updateLocale("vi", localization);
// paypal.configure({
//   mode: "sandbox",
//   client_id:
//     "AaeuRt8WCq9SBliEVfEyXXQMosfJD-U9emlCflqe8Blz_KWZ3lnXh1piEMcXuo78MvWj0hBKgLN-FamT",
//   client_secret:
//     "ENWZDMzk17X3mHFJli7sFlS9RT1Vi_aocaLsrftWZ2tjHtBVFMzr4kPf5_9iIcsbFWsHf95vXVi6EADv",
// });

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
      // Code để xử lý hình ảnh từ link
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

    // Lấy thông tin địa chỉ người dùng và người dùng
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

    // Xử lý hình ảnh và loại voucher
    if (order.image) {
      order.image = await processImage(order.image);
    }

    order.voucherData.typeVoucherOfVoucherData = await db.TypeVoucher.findOne({
      where: { id: order.voucherData.typeVoucherId },
    });

    // Lấy danh sách orderDetail
    const orderDetail = await db.OrderDetail.findAll({
      where: { orderId: id },
    });

    // Xử lý orderDetail
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

      // Xử lý hình ảnh của sản phẩm
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
    const { id, statusId } = data;

    if (!id || !statusId) {
      return missingRequiredParams("Id, statusId are");
    }

    let order = await db.Order.findOne({ where: { id: data.id } });

    if (!order) {
      return notFound(`Order with id ${id}`);
    }

    // Cập nhật trạng thái đơn hàng
    order.statusId = data.statusId;
    await order.save();
    console.log("Order found:", order);

    // Nếu trạng thái là 'S7' và có dữ liệu orderDetail được cung cấp
    if (
      data.statusId === "S7" &&
      data.dataOrder &&
      data.dataOrder.orderDetail &&
      data.dataOrder.orderDetail.length > 0
    ) {
      for (let i = 0; i < data.dataOrder.orderDetail.length; i++) {
        let productSize = await db.ProductSize.findOne({
          where: { id: data.dataOrder.orderDetail[i].productSize.id },
        });

        if (!productSize) {
          return notFound(
            `ProductSize for id ${data.dataOrder.orderDetail[i].productSize.id}.`
          );
        }

        // Cập nhật số lượng tồn kho của sản phẩm
        productSize.stock += data.dataOrder.orderDetail[i].quantity;
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
      errorResponse("userId is required!");
    }

    let addressUsers = await db.AddressUser.findAll({
      where: { userId: userId },
    });

    for (let i = 0; i < addressUsers.length; i++) {
      let orders = await db.Order.findAll({
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

        let orderDetail = await db.OrderDetail.findAll({
          where: { orderId: orders[j].id },
        });

        for (let k = 0; k < orderDetail.length; k++) {
          let productSize = await db.ProductSize.findOne({
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

          let productImages = await db.ProductImage.findAll({
            where: { productDetailId: orderDetail[k].productDetail.id },
          });

          for (let f = 0; f < productImages.length; f++) {
            productImages[f].image = Buffer.from(
              productImages[f].image,
              "base64"
            ).toString("binary");
          }

          orderDetail[k].productImage = productImages;
        }

        orders[j].orderDetail = orderDetail;
      }

      addressUsers[i].order = orders;
    }

    return {
      result: [addressUsers],
      errCode: 0,
      errors: ["Retrieved all order by user successfully!"],
    };
  } catch (error) {
    console.log("Errors", error);
    errorResponse("Error from server!");
  }
};

const getAllOrdersByShipper = async (data) => {
  try {
    if (!data.shipperId) {
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
      where: { shipperId: data.shipperId },
    };

    if (data.status === "working") {
      objectFilter.where = { ...objectFilter.where, statusId: "S5" };
    } else if (data.status === "done") {
      objectFilter.where = { ...objectFilter.where, statusId: "S6" };
    }

    let orders = await db.Order.findAll(objectFilter);

    for (let i = 0; i < orders.length; i++) {
      let addressUser = await db.AddressUser.findOne({
        where: { id: orders[i].addressUserId },
      });

      if (addressUser) {
        let user = await db.User.findOne({ where: { id: addressUser.userId } });

        orders[i].userData = user;
        orders[i].addressUser = addressUser;
      }
    }

    return {
      result: [orders],
      errCode: 200,
      errors: ["Retrieved all order by shipper successfully!"],
    };
  } catch (error) {
    return errorResponse(error.message);
  }
};

const paymentOrder = async (data) => {
  try {
    let listItem = [];
    let totalPriceProduct = 0;

    for (let i = 0; i < data.result.length; i++) {
      const productSize = await db.ProductSize.findOne({
        where: { id: data.result[i].productId },
        include: [{ model: db.AllCode, as: "productSizeData" }],
        raw: true,
        nest: true,
      });

      const productDetail = await db.ProductDetail.findOne({
        where: { id: productSize.productDetailId },
      });

      const product = await db.Product.findOne({
        where: { id: productDetail.productId },
      });

      const realPrice = parseFloat(
        (data.result[i].realPrice / EXCHANGE_RATES.USD).toFixed(2)
      );

      console.log(realPrice);
      console.log(data.total);

      listItem.push({
        name: `${product.name} | ${productDetail.nameDetail} | ${productSize.sizeData.value}`,
        sku: `${data.result[i].productId}`,
        price: `${realPrice}`,
        currency: "USD",
        quantity: data.result[i].quantity,
      });

      totalPriceProduct += realPrice * data.result[i].quantity;
      console.log(data.total - totalPriceProduct);
    }

    listItem.push({
      name: "Phi ship + Voucher",
      sku: "1",
      price: `${parseFloat(data.total - totalPriceProduct).toFixed(2)}`,
      currency: "USD",
      quantity: 1,
    });

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `http://localhost:5000/payment/success`,
        cancel_url: "http://localhost:5000/payment/cancel",
      },
      transactions: [
        {
          item_list: {
            items: listItem,
          },
          amount: {
            currency: "USD",
            total: data.total,
          },
          description: "This is the payment description.",
        },
      ],
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
      if (error) {
        resolve(errorResponse(error));
      } else {
        resolve(successResponse({ link: payment.links[1].href }));
      }
    });
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

export default {
  createOrder,
  getAllOrders,
  getOrderById,
  updateStatusOrder,
  getAllOrdersByUser,
  paymentOrder,
  paymentOrderSuccess,
  confirmOrder,
  getAllOrdersByShipper,
};
