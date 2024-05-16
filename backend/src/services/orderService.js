import { v4 as uuidv4 } from "uuid";
import db from "../models/index";
const { Op } = require("sequelize");
var querystring = require("qs");
var crypto = require("crypto");
require("dotenv").config();
import {
  successResponse,
  errorResponse,
  missingRequiredParams,
  notFound,
} from "../utils/ResponseUtils";

const createOrder = async (data) => {
  try {
    if (
      !data.addressUserId ||
      !data.typeShipId ||
      !data.userId ||
      !data.arrDataShopCart ||
      data.arrDataShopCart.length === 0
    ) {
      return missingRequiredParams(
        "addressUserId, typeShipId, userId, and arrDataShopCart"
      );
    }

    // Tạo đơn hàng
    const order = await db.Order.create({
      addressUserId: data.addressUserId,
      isPaymentOnline: data.isPaymentOnline || 0, // Thanh toán Online hay COD
      statusId: "S3", // Chờ xác nhận
      typeShipId: data.typeShipId,
      note: data.note || "",
    });

    // Thêm chi tiết đơn hàng từ shop cart
    const orderDetails = [];
    for (const item of data.arrDataShopCart) {
      const productDetail = await db.ProductDetail.findOne({
        where: { productId: item.productId },
      });

      if (productDetail) {
        orderDetails.push({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          // Lấy giá thực tế từ productDetail và tính toán giá cuối cùng
          realPrice:
            item.quantity *
            (productDetail.discountPrice || productDetail.originalPrice),
        });
      } else {
        console.error(
          `Product detail not found for productId: ${item.productId}`
        );
        // Xử lý lỗi nếu cần
      }
    }

    // Tạo các chi tiết đơn hàng
    await db.OrderDetail.bulkCreate(orderDetails);

    // Xóa sản phẩm đã đặt khỏi shop cart
    await db.ShopCart.destroy({ where: { userId: data.userId, statusId: 0 } });

    // Cập nhật số lượng tồn kho của sản phẩm
    for (const cartItem of data.arrDataShopCart) {
      const productSize = await db.ProductSize.findByPk(cartItem.productId);
      if (productSize) {
        await db.ProductSize.update(
          { stock: productSize.stock - cartItem.quantity },
          { where: { productId: cartItem.productId } }
        );
      }
    }
    return {
      result: [
        {
          orderId: order.id,
          addressUserId: data.addressUserId,
          productId: data.arrDataShopCart.map((item) => item.productId),
        },
      ],
      statusCode: 200,
      errors: [`Create order successfully!`],
    };
  } catch (error) {
    console.error("Error in createOrder:", error);
    return errorResponse("Error from server");
  }
};

const confirmOrder = async (data) => {
  try {
    if (!data.orderId || !data.statusId) {
      return missingRequiredParams("orderId and statusId");
    }

    const order = await db.Order.findOne({
      where: { id: data.orderId },
      raw: false,
    });

    if (!order) {
      return notFound(`Order with id ${data.orderId}`);
    }

    order.statusId = data.statusId;

    if (data.statusId === "S6" && data.isPaymentOnline) {
      // S6: đã giao hàng
      order.isPaymentOnline = 0;
    }

    await order.save();
    return successResponse("Confirm order");
  } catch (error) {
    console.error("Error in confirmOrder:", error);
    return errorResponse(error.message);
  }
};

const getAllOrders = async (data) => {
  try {
    let orderFilter = {
      include: [
        { model: db.TypeShip, as: "typeShipData" },
        { model: db.AllCode, as: "statusOrderData" },
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
      nest: true,
    };

    if (data.limit && data.offset) {
      orderFilter.limit = +data.limit;
      orderFilter.offset = +data.offset;
    }
    if (data.statusId && data.statusId !== "ALL") {
      orderFilter.where = { statusId: data.statusId };
    }

    let { rows, count } = await db.Order.findAndCountAll(orderFilter);

    if (rows.length === 0) {
      return {
        result: [],
        statusCode: 0,
        errors: ["No orders found!"],
      };
    }

    // Fetch addressUser information for orders
    let addressUsers = await db.AddressUser.findAll({
      where: { id: { [Op.in]: rows.map((order) => order.addressUserId) } },
      raw: true,
      nest: true,
    });

    // Fetch order details for the orders
    let orderDetails = await db.OrderDetail.findAll({
      where: { orderId: rows.map((order) => order.id) },
      raw: true,
      nest: true,
    });

    // Fetch product details for the order details
    let productIds = orderDetails.map((detail) => detail.productId);
    let productDetails = await db.ProductDetail.findAll({
      where: { id: productIds },
      include: [{ model: db.Product, as: "productData", raw: true }],
      raw: true,
      nest: true,
    });

    // Map addressUser information to orders
    const addressUserMap = addressUsers.reduce((acc, addressUser) => {
      acc[addressUser.id] = addressUser;
      return acc;
    }, {});

    // Formatting code...
    const formattedRows = rows.map((order) => {
      const addressUser = addressUserMap[order.addressUserId] || {};
      const statusOrder =
        (order.statusOrderData && order.statusOrderData.value) || "";
      const typeShip = order.typeShipData || {};

      const orderDetailData = orderDetails.filter(
        (detail) => detail.orderId === order.id
      );
      const products = orderDetailData.map((detail) => {
        const productDetail = productDetails.find(
          (product) => product.id === detail.productId
        );
        const product = productDetail.productData || {};

        const quantity = detail.quantity || 0;
        const realPrice = detail.realPrice || 0;
        return {
          productName: product.name || "",
          quantity,
          priceProduct: realPrice,
          color: productDetail.color || "",
        };
      });

      // Calculate totalPrice for the order
      const totalPrice =
        products.reduce(
          (acc, product) => acc + product.quantity * product.priceProduct,
          0
        ) + (typeShip.price || 0);

      return {
        id: order.id,
        addressUser: {
          userId: addressUser.userId || null,
          shipName: addressUser.shipName || "",
          shipAddress: addressUser.shipAddress || "",
          shipEmail: addressUser.shipEmail || "",
          shipPhoneNumber: addressUser.shipPhoneNumber || "",
        },
        statusOrder,
        typeShip: {
          type: typeShip.type || "",
          price: typeShip.price || 0,
        },
        note: order.note || "",
        isPaymentOnline: order.isPaymentOnline || 0,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        products: products,
        totalPrice: totalPrice,
      };
    });

    return {
      result: formattedRows,
      statusCode: 200,
      errors: ["Get all order successfully!"],
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      result: [],
      statusCode: 500,
      errors: [error.message],
    };
  }
};

const getOrderById = async (data) => {
  try {
    if (!data.id) {
      return missingRequiredParams("id");
    }

    let order = await db.Order.findOne({
      where: { id: data.id },
      include: [
        { model: db.TypeShip, as: "typeShipData" },
        { model: db.AllCode, as: "statusOrderData" },
      ],
      raw: true,
      nest: true,
    });

    if (!order) {
      return notFound(`Order with id ${data.id}`);
    }

    let addressUser = await db.AddressUser.findOne({
      where: { id: order.addressUserId },
    });

    if (!addressUser) {
      return notFound(`AddressUser for order with id ${data.id}`);
    }

    let user = await db.User.findOne({ where: { id: addressUser.userId } });

    if (!user) {
      return notFound(`User for AddressUser with id ${addressUser.id}`);
    }

    let orderDetails = await db.OrderDetail.findAll({
      where: { orderId: order.id },
      raw: true,
      nest: true,
    });

    // Lặp qua mỗi order detail và lấy thông tin sản phẩm cho từng chi tiết đơn hàng
    for (let i = 0; i < orderDetails.length; i++) {
      let productData = await db.Product.findOne({
        where: { id: orderDetails[i].productId },
      });

      orderDetails[i].productData = productData;
    }
    let result = {
      orderId: order.id,
      addressUser: {
        userId: addressUser.userId,
        shipName: addressUser.shipName,
        shipAddress: addressUser.shipAddress,
        shipEmail: addressUser.shipEmail,
        shipPhoneNumber: addressUser.shipPhoneNumber,
      },
      status: order.statusOrderData.value,
      typeShip: order.typeShipData.type,
      note: order.note,
      isPaymentOnline: order.isPaymentOnline,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return {
      result: result,
      statusCode: 200,
      errors: ["Success!"],
    };
  } catch (error) {
    console.error("Error:", error);
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
      statusId === "S7" && //S7: hủy đơn
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
          { model: db.AllCode, as: "statusOrderData" },
          { model: db.TypeShip, as: "typeShipData" },
        ],
        raw: true,
        nest: true,
      });
      for (let j = 0; j < orders.length; j++) {
        const orderDetail = await db.OrderDetail.findAll({
          where: { orderId: orders[j].id },
        });
        const totalPrice = orderDetail.reduce(
          (acc, curr) => acc + curr.price,
          0
        );
        const quantity = orderDetail.reduce(
          (acc, curr) => acc + curr.quantity,
          0
        );

        const formattedOrder = {
          id: orders[j].id,
          status: orders[j].statusOrderData.value,
          typeShip: orders[j].typeShipData.value,
          totalPrice: totalPrice,
          quantity: quantity,
          isPaymentOnline: orders[j].isPaymentOnline,
          image: orders[j].image,
          createdAt: orders[j].createdAt,
          updatedAt: orders[j].updatedAt,
        };

        result.push(formattedOrder);
      }
    }
    return {
      result: result,
      statusCode: 0,
      errors: ["Retrieved all orders by user successfully!"],
    };
  } catch (error) {
    console.error("Errors", error);
    return errorResponse(error.message);
  }
};

const paymentOrderVNPay = async (req) => {
  try {
    var ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    console.log("vnp_IpAddr", ipAddr);
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
    var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    console.log("vnp_SecureHash", signed);
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
    console.log(vnpUrl);
    return {
      result: [vnpUrl],
      statusCode: 200,
      errors: ["Success!"],
    };
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(error.message);
  }
};

const confirmOrderVNPay = async (data) => {
  try {
    var vnp_Params = data;
    var secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];
    vnp_Params = sortObject(vnp_Params);
    var secretKey = process.env.VNP_HASHSECRET;
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    if (secureHash === signed) {
      return successResponse("Confirm payment by VNPay");
    } else {
      return errorResponse("Failed payment by VNPay");
    }
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(error.message);
  }
};

const paymentOrderVNPaySuccess = async (data) => {
  try {
    const order = await db.Order.create({
      addressUserId: data.addressUserId,
      isPaymentOnline: data.isPaymentOnline ? 1 : 0, // thanh toán online hay COD
      statusId: "S3", // Chờ xác nhận
      typeShipId: data.typeShipId,
      note: data.note,
    });

    const updatedShopCart = data.arrDataShopCart.map((item) => ({
      ...item,
      orderId: order.id,
    }));

    await db.OrderDetail.bulkCreate(updatedShopCart);

    await db.ShopCart.destroy({
      where: { userId: data.userId, statusId: 0 },
    });

    for (const cartItem of updatedShopCart) {
      const productDetailSize = await db.ProductSize.findOne({
        where: { id: cartItem.productId },
        raw: false,
      });
      if (productDetailSize) {
        productDetailSize.stock -= cartItem.quantity;
        await productDetailSize.save();
      }
    }

    return successResponse("Payment by VNPay processed", {
      orderId: order.id,
    });
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(error.message);
  }
};

const getAllOrdersByShipper = async (shipperId, status) => {
  try {
    if (!shipperId) {
      return missingRequiredParams("shipperId is");
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
      statusCode: 200,
      errors: ["Retrieved all orders by shipper successfully!"],
    };
  } catch (error) {
    console.log(error);
    return errorResponse(error.message);
  }
};

function sortObject(obj) {
  var sorted = {};
  var str = [];
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

export default {
  createOrder,
  getAllOrders,
  getOrderById,
  updateStatusOrder,
  getAllOrdersByUser,
  paymentOrderVNPay,
  confirmOrderVNPay,
  paymentOrderVNPaySuccess,
  confirmOrder,
  getAllOrdersByShipper,
  sortObject,
};
