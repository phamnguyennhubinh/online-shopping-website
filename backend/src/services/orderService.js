import { v4 as uuidv4 } from "uuid";
import db from "../models/index";
const { Op } = require("sequelize");
var querystring = require("qs");
var crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");
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

    // Create the order
    const order = await db.Order.create({
      addressUserId: data.addressUserId,
      isPaymentOnline: data.isPaymentOnline || 0, // Payment type: Online or COD
      statusId: "S3", // Waiting for confirmation
      typeShipId: data.typeShipId,
      note: data.note || "",
    });

    // Create or update address details
    await db.AddressUser.create({
      userId: data.userId,
      shipName: data.userId,
      shipAddress: data.shipAddress,
      shipEmail: data.shipEmail,
      shipPhoneNumber: data.shipPhoneNumber,
    });

    // Add order details from shop cart
    const orderDetails = [];
    for (const item of data.arrDataShopCart) {
      const productSize = await db.ProductSize.findOne({
        where: { id: item.sizeId },
        include: [
          {
            model: db.ProductDetail,
            as: "productDetailData",
            attributes: ["id", "productId", "discountPrice", "originalPrice"],
          },
        ],
        raw: true,
        nest: true,
      });

      if (productSize) {
        const price =
          productSize.productDetailData.discountPrice ||
          productSize.productDetailData.originalPrice;
        orderDetails.push({
          orderId: order.id,
          productId: productSize.productDetailData.productId,
          productDetailId: productSize.productDetailData.id,
          sizeId: item.sizeId,
          quantity: item.quantity,
          realPrice: item.quantity * price,
        });
      } else {
        console.error(`Product size not found for sizeId: ${item.sizeId}`);
      }
    }

    // Create order details
    await db.OrderDetail.bulkCreate(orderDetails);

    // Remove items from shop cart
    await db.ShopCart.destroy({ where: { userId: data.userId, statusId: 0 } });

    // Update inventory quantities
    for (const cartItem of data.arrDataShopCart) {
      const productSize = await db.ProductSize.findByPk(cartItem.sizeId);
      if (productSize) {
        await db.ProductSize.update(
          { stock: productSize.stock - cartItem.quantity },
          { where: { id: cartItem.sizeId } }
        );
      }
    }

    return {
      result: [
        {
          orderId: order.id,
          addressUserId: data.addressUserId,
          productDetails: orderDetails.map((detail) => ({
            productId: detail.productId,
            productDetailId: detail.productDetailId,
            sizeId: detail.sizeId,
          })),
          userId: data.userId,
        },
      ],
      statusCode: 200,
      errors: ["Create order successfully!"],
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

    let orderIds = rows.map((order) => order.id);

    let orderDetails = await db.OrderDetail.findAll({
      where: { orderId: orderIds },
      raw: true,
      nest: true,
    });

    let sizeIds = orderDetails.map((detail) => detail.sizeId);

    let productSizes = await db.ProductSize.findAll({
      where: { id: sizeIds },
      include: [
        {
          model: db.ProductDetail,
          as: "productDetailData",
          include: [
            {
              model: db.Product,
              as: "productData",
              raw: true,
            },
            {
              model: db.ProductImage,
              as: "productImageData",
              attributes: ["id", "image"],
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });

    let addressUsers = await db.AddressUser.findAll({
      where: { id: { [Op.in]: rows.map((order) => order.addressUserId) } },
      raw: true,
      nest: true,
    });

    const addressUserMap = addressUsers.reduce((acc, addressUser) => {
      acc[addressUser.id] = addressUser;
      return acc;
    }, {});

    const formattedRows = await Promise.all(
      rows.map(async (order) => {
        const addressUser = addressUserMap[order.addressUserId] || {};
        const statusOrder = order.statusOrderData?.value || "";
        const typeShip = {
          type: order.typeShipData?.type || "",
          price: order.typeShipData?.price || 0,
        };

        const orderDetailData = orderDetails.filter(
          (detail) => detail.orderId === order.id
        );

        const products = await Promise.all(
          orderDetailData.map(async (detail) => {
            const productSize = productSizes.find(
              (size) => size.id === detail.sizeId
            );
            const productDetail = productSize?.productDetailData || {};
            const product = productDetail.productData || {};

            // Fetch color directly from ProductDetail
            const color = productDetail.color || "";

            // Fetch size directly from ProductSize
            const size = {
              sizeId: productSize.sizeId,
              height: productSize.height,
              weight: productSize.weight,
            };

            // Fetch images related to the product
            const images = await db.ProductImage.findAll({
              where: { productDetailId: productDetail.id },
              attributes: ["id", "image"],
              raw: true,
            });

            // Convert images to base64
            const imagesBase64 = await Promise.all(
              images.map(async (img) => {
                try {
                  const imagePath = path.join(
                    __dirname,
                    "../..",
                    "uploads",
                    img.image
                  );
                  await fs.stat(imagePath);
                  const data = await fs.readFile(imagePath);
                  const imageData = data.toString("base64");
                  return `data:image/jpeg;base64,${imageData}`;
                } catch (error) {
                  console.error("Error converting image to base64:", error);
                  return null;
                }
              })
            ).then((results) => results.filter((result) => result !== null));

            const quantity = detail.quantity || 0;
            const realPrice = detail.realPrice || 0;

            return {
              productName: product.name || "",
              quantity,
              productId: productDetail.productId,
              priceProduct: realPrice,
              color,
              size,
              images: imagesBase64,
            };
          })
        );

        const totalPrice =
          products.reduce((acc, product) => acc + product.priceProduct, 0) +
          (typeShip.price || 0);

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
          typeShip,
          note: order.note || "",
          isPaymentOnline: order.isPaymentOnline || 0,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          products,
          totalPrice,
        };
      })
    );

    return {
      result: formattedRows,
      statusCode: 200,
      errors: ["Get all orders successfully!"],
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

    // Define filter to fetch order including typeShip, statusOrder
    let orderFilter = {
      where: { id: data.id },
      include: [
        { model: db.TypeShip, as: "typeShipData" },
        { model: db.AllCode, as: "statusOrderData" },
      ],
      raw: true,
      nest: true,
    };

    // Fetch the order
    const order = await db.Order.findOne(orderFilter);

    if (!order) {
      return notFound(`Order with id ${data.id}`);
    }

    // Fetch order details associated with the order
    const orderDetails = await db.OrderDetail.findAll({
      where: { orderId: order.id },
      raw: true,
      nest: true,
    });

    // Extract productSizeIds from orderDetails
    const productSizeIds = orderDetails.map((detail) => detail.sizeId);

    // Fetch productDetails and sizes associated with productSizeIds
    const productSizes = await db.ProductSize.findAll({
      where: { id: productSizeIds },
      include: [
        {
          model: db.ProductDetail,
          as: "productDetailData",
          include: [
            {
              model: db.Product,
              as: "productData",
              raw: true,
            },
            {
              model: db.ProductImage,
              as: "productImageData",
              attributes: ["id", "image"],
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });

    // Fetch addressUser associated with the order
    const addressUser = await db.AddressUser.findOne({
      where: { id: order.addressUserId },
      raw: true,
      nest: true,
    });

    if (!addressUser) {
      return {
        result: [],
        statusCode: 500,
        errors: ["AddressUser is not associated to Order!"],
      };
    }

    // Build products array with details
    const products = await Promise.all(
      orderDetails.map(async (detail) => {
        const productSize = productSizes.find(
          (size) => size.id === detail.sizeId
        );
        const productDetail = productSize?.productDetailData || {};
        const product = productDetail?.productData || {};

        // Fetch color directly from ProductDetail
        const color = productDetail?.color || "";

        // Fetch size directly from ProductSize
        const size = {
          sizeId: productSize.sizeId,
          height: productSize.height,
          weight: productSize.weight,
        };

        // Fetch images related to the product
        const images = await db.ProductImage.findAll({
          where: { productDetailId: productDetail.id },
          attributes: ["id", "image"],
          raw: true,
        });

        // Convert images to base64
        const imagesBase64 = await Promise.all(
          images.map(async (img) => {
            try {
              const imagePath = path.join(
                __dirname,
                "../..",
                "uploads",
                img.image
              );
              await fs.stat(imagePath);
              const data = await fs.readFile(imagePath);
              const imageData = data.toString("base64");
              return `data:image/jpeg;base64,${imageData}`;
            } catch (error) {
              console.error("Error converting image to base64:", error);
              return null;
            }
          })
        ).then((results) => results.filter((result) => result !== null));

        return {
          productName: product.name || "",
          quantity: detail.quantity || 0,
          productId: productDetail.productId,
          priceProduct: detail.realPrice || 0,
          color,
          size,
          images: imagesBase64,
        };
      })
    );

    // Calculate total price including shipping type price
    const totalPrice =
      products.reduce((acc, product) => acc + product.priceProduct, 0) +
      (order.typeShipData?.price || 0);

    // Construct the result object with all necessary details
    const result = {
      id: order.id,
      addressUser: {
        userId: addressUser.userId || null,
        shipName: addressUser.shipName || "",
        shipAddress: addressUser.shipAddress || "",
        shipEmail: addressUser.shipEmail || "",
        shipPhoneNumber: addressUser.shipPhoneNumber || "",
      },
      statusOrder: order.statusOrderData?.value || "",
      typeShip: {
        type: order.typeShipData?.type || "",
        price: order.typeShipData?.price || 0,
      },
      note: order.note || "",
      isPaymentOnline: order.isPaymentOnline || 0,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      products,
      totalPrice,
    };

    return {
      result,
      statusCode: 200,
      errors: [`Get order with id = ${data.id} successfully!`],
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
      return {
        result: [],
        statusCode: 400,
        errors: ["Missing userId parameter"],
      };
    }

    // Step 1: Find addressUserIds associated with the userId
    const addressUsers = await db.AddressUser.findAll({
      where: { userId },
      raw: true,
      nest: true,
    });

    if (addressUsers.length === 0) {
      return {
        result: [],
        statusCode: 404,
        errors: ["User not found or has no associated addresses"],
      };
    }

    // Step 2: Extract addressUserIds
    const addressUserIds = addressUsers.map((addressUser) => addressUser.id);

    // Step 3: Find orders related to the addressUserIds
    const orders = await db.Order.findAll({
      where: { addressUserId: addressUserIds },
      include: [
        { model: db.AllCode, as: "statusOrderData" },
        { model: db.TypeShip, as: "typeShipData" },
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
      nest: true,
    });

    if (orders.length === 0) {
      return {
        result: [],
        statusCode: 404,
        errors: ["No orders found for this user"],
      };
    }

    // Step 4: Extract orderIds
    const orderIds = orders.map((order) => order.id);

    // Step 5: Find order details related to the orderIds
    const orderDetails = await db.OrderDetail.findAll({
      where: { orderId: orderIds },
      raw: true,
      nest: true,
    });

    // Step 6: Extract productSizeIds from orderDetails
    const productSizeIds = orderDetails.map((detail) => detail.sizeId);

    // Step 7: Find productDetails and sizes related to the productSizeIds
    const productSizes = await db.ProductSize.findAll({
      where: { id: productSizeIds },
      include: [
        {
          model: db.ProductDetail,
          as: "productDetailData",
          include: [
            {
              model: db.Product,
              as: "productData",
              raw: true,
            },
            {
              model: db.ProductImage,
              as: "productImageData",
              attributes: ["id", "image"],
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });

    // Step 8: Map addressUsers to an object for easy access
    const addressUserMap = addressUsers.reduce((acc, addressUser) => {
      acc[addressUser.id] = addressUser;
      return acc;
    }, {});

    // Step 9: Format orders with all required details
    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        const addressUser = addressUserMap[order.addressUserId] || {};
        const statusOrder = order.statusOrderData?.value || "";
        const typeShip = {
          type: order.typeShipData?.type || "",
          price: order.typeShipData?.price || 0,
        };

        const orderDetailData = orderDetails.filter(
          (detail) => detail.orderId === order.id
        );

        const products = await Promise.all(
          orderDetailData.map(async (detail) => {
            const productSize = productSizes.find(
              (size) => size.id === detail.sizeId
            );
            const productDetail = productSize?.productDetailData || {};
            const product = productDetail?.productData || {};

            // Fetch color directly from ProductDetail
            const color = productDetail?.color || "";

            // Fetch size directly from ProductSize
            const size = {
              sizeId: productSize.sizeId,
              height: productSize.height,
              weight: productSize.weight,
            };

            // Fetch images related to the product
            const images = await db.ProductImage.findAll({
              where: { productDetailId: productDetail.id },
              attributes: ["id", "image"],
              raw: true,
            });

            // Convert images to base64
            const imagesBase64 = await Promise.all(
              images.map(async (img) => {
                try {
                  const imagePath = path.join(
                    __dirname,
                    "../..",
                    "uploads",
                    img.image
                  );
                  await fs.stat(imagePath);
                  const data = await fs.readFile(imagePath);
                  const imageData = data.toString("base64");
                  return `data:image/jpeg;base64,${imageData}`;
                } catch (error) {
                  console.error("Error converting image to base64:", error);
                  return null;
                }
              })
            ).then((results) => results.filter((result) => result !== null));

            return {
              productName: product.name || "",
              quantity: detail.quantity || 0,
              productId: productDetail.productId,
              priceProduct: detail.realPrice || 0,
              color,
              size,
              images: imagesBase64,
            };
          })
        );

        const totalPrice =
          products.reduce((acc, product) => acc + product.priceProduct, 0) +
          (order.typeShipData?.price || 0);

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
          typeShip,
          note: order.note || "",
          isPaymentOnline: order.isPaymentOnline || 0,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          products,
          totalPrice,
        };
      })
    );

    return {
      result: formattedOrders,
      statusCode: 200,
      errors: ["Fetched all orders for the user successfully"],
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


const paymentOrderVNPay = async (req) => {
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
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
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
