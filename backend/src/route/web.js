import express from "express";
import userController from "../controllers/userController";
import allcodeController from "../controllers/allcodeController";
import productController from "../controllers/productController";
import typeShipController from "../controllers/typeShipController";
import voucherController from "../controllers/voucherController";
import shopCartController from "../controllers/shopCartController";
import middlewareControllers from "../middlewares/jwtVerify";
import supplierController from "../controllers/supplierController";
import receiptController from "../controllers/receiptController";
import orderController from "../controllers/orderController";
import statisticController from "../controllers/statisticController";
import addressUserController from "../controllers/addressUserController";

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const webRoutes = (app) => {
  const router = express.Router();
  //---------------------------API USER------------------------------//
  router.post("/api/user/register", userController.registerUser);
  router.post("/api/user/login", userController.loginUser);
  router.put(
    "/api/user/update",
    middlewareControllers.verifyTokenUser,
    userController.updateUser
  );
  router.delete(
    "/api/user/delete",
    // middlewareControllers.verifyTokenAdmin,
    userController.deleteUser
  );
  router.get(
    "/api/user",
    // middlewareControllers.verifyTokenAdmin,
    userController.getAllUser
  );
  router.get("/api/user/get-by-id", userController.getUserById);
  router.post(
    "/api/user/change-password",
    // middlewareControllers.verifyTokenUser,
    userController.changePassword
  );

  //---------------------------API ALLCODE------------------------------//
  router.post("/api/code/create", allcodeController.createNewCode);
  router.put("/api/code/update", allcodeController.updateCode);
  router.delete("/api/code/delete", allcodeController.deleteCode);
  router.get("/api/code", allcodeController.getAllCode);
  router.get("/api/code/get-list", allcodeController.getListCode);
  router.get("/api/code/get-by-id", allcodeController.getCodeById);

  //---------------------------API PRODUCT------------------------------//
  router.post(
    "/api/product/create",
    // middlewareControllers.verifyTokenAdmin,
    upload.array("images"),
    productController.createProduct
  );
  router.get(
    "/api/product/get-all-admin",
    // middlewareControllers.verifyTokenAdmin,
    productController.getAllProductAdmin
  );
  router.get("/api/product/get-all-user", productController.getAllProductUser);
  router.get("/api/product/get-by-id", productController.getProductById);
  router.post(
    "/api/product/inActive",
    // middlewareControllers.verifyTokenAdmin,
    productController.inActiveProduct
  );
  router.post(
    "/api/product/active",
    // middlewareControllers.verifyTokenAdmin,
    productController.activeProduct
  );
  router.put(
    "/api/product/update",
    // middlewareControllers.verifyTokenAdmin,
    upload.array("images"),
    productController.updateProduct
  );

  router.delete(
    "/api/product/delete",
    middlewareControllers.verifyTokenAdmin,
    productController.deleteProduct
  );

  // PRODUCT DETAIL
  router.post(
    "/api/product/detail/create",
    // middlewareControllers.verifyTokenAdmin,
    productController.createProductDetail
  );
  router.get(
    "/api/product/detail/get-by-id",
    productController.getProductDetailById
  );
  router.put(
    "/api/product/detail/update",
    // middlewareControllers.verifyTokenAdmin,
    productController.updateProductDetail
  );
  router.delete(
    "/api/product/detail/delete",
    // middlewareControllers.verifyTokenAdmin,
    productController.deleteProductDetail
  );

  // PRODUCT IMAGE
  router.post(
    "/api/product/upload-files",
    // middlewareControllers.verifyTokenAdmin,
    upload.array("images"),
    productController.uploadProductImages
  );
  router.get("/api/product/image", productController.getAllProductImage);
  router.get(
    "/api/product/image/get-by-id",
    productController.getProductImageById
  );
  router.put(
    "/api/product/image/update",
    // middlewareControllers.verifyTokenAdmin,
    upload.array("images"),
    productController.updateProductImage
  );
  router.delete(
    "/api/product/image/delete",
    // middlewareControllers.verifyTokenAdmin,
    productController.deleteProductImage
  );

  // PRODUCT SIZE
  router.post(
    "/api/product/size/create",
    // middlewareControllers.verifyTokenAdmin,
    productController.createProductSize
  );
  router.get("/api/product/size", productController.getAllProductSize);
  router.get(
    "/api/product/size/get-by-id",
    productController.getProductSizeById
  );
  router.put(
    "/api/product/size/update",
    // middlewareControllers.verifyTokenAdmin,
    productController.updateProductSize
  );
  router.delete(
    "/api/product/size/delete",
    // middlewareControllers.verifyTokenAdmin,
    productController.deleteProductSize
  );
  router.get("/api/product/get-feature", productController.getProductFeature);
  router.get("/api/product/get-new", productController.getProductNew);
  router.get("/api/product/shopcart", productController.getProductShopCart);
  router.get("/api/product/recommend", productController.getProductRecommend);

  //---------------------------API TYPE-SHIP------------------------------//
  router.post(
    "/api/type-ship/create",
    // middlewareControllers.verifyTokenAdmin,
    typeShipController.createTypeShip
  );
  router.get("/api/type-ship/get-by-id", typeShipController.getTypeShipById);
  router.get("/api/type-ship", typeShipController.getAllTypeShip);
  router.put(
    "/api/type-ship/update",
    // middlewareControllers.verifyTokenAdmin,
    typeShipController.updateTypeShip
  );
  router.delete(
    "/api/type-ship/delete",
    // middlewareControllers.verifyTokenAdmin,
    typeShipController.deleteTypeShip
  );

  //---------------------------API TYPE-VOUCHER------------------------------//
  router.post(
    "/api/type-voucher/create",
    // middlewareControllers.verifyTokenAdmin,
    voucherController.createTypeVoucher
  );
  router.get(
    "/api/type-voucher/get-by-id",
    voucherController.getTypeVoucherById
  );
  router.get("/api/type-voucher", voucherController.getAllTypeVoucher);
  router.put(
    "/api/type-voucher/update",
    // middlewareControllers.verifyTokenAdmin,
    voucherController.updateTypeVoucher
  );
  router.delete(
    "/api/type-voucher/delete",
    // middlewareControllers.verifyTokenAdmin,
    voucherController.deleteTypeVoucher
  );
  router.get(
    "/api/type-voucher/select",
    voucherController.getSelectTypeVoucher
  );

  //---------------------------API VOUCHER------------------------------//
  router.post(
    "/api/voucher/create",
    // middlewareControllers.verifyTokenAdmin,
    voucherController.createVoucher
  );
  router.get("/api/voucher/get-by-id", voucherController.getVoucherById);
  router.get("/api/voucher", voucherController.getAllVoucher);
  router.put(
    "/api/voucher/update",
    // middlewareControllers.verifyTokenAdmin,
    voucherController.updateVoucher
  );
  router.delete(
    "/api/voucher/delete",
    // middlewareControllers.verifyTokenAdmin,
    voucherController.deleteVoucher
  );
  router.post(
    "/api/voucher/user-save",
    // middlewareControllers.verifyTokenUser,
    voucherController.saveUserVoucher
  );
  router.get(
    "/api/voucher/get-all-by-user-id",
    voucherController.getAllVoucherByUserId
  );

  //---------------------------API SUPPLIER------------------------------//
  router.post(
    "/api/supplier/create",
    // middlewareControllers.verifyTokenAdmin,
    supplierController.createSupplier
  );
  router.get("/api/supplier/get-by-id", supplierController.getSupplierById);
  router.get("/api/supplier", supplierController.getAllSupplier);
  router.put(
    "/api/supplier/update",
    // middlewareControllers.verifyTokenAdmin,
    supplierController.updateSupplier
  );
  router.delete(
    "/api/supplier/delete",
    // middlewareControllers.verifyTokenAdmin,
    supplierController.deleteSupplier
  );
  //---------------------------API RECEIPT------------------------------//
  router.post(
    "/api/receipt/create",
    // middlewareControllers.verifyTokenAdmin,
    receiptController.createReceipt
  );
  router.get("/api/receipt/get-by-id", receiptController.getReceiptById);
  router.get("/api/receipt", receiptController.getAllReceipt);
  router.put(
    "/api/receipt/update",
    // middlewareControllers.verifyTokenAdmin,
    receiptController.updateReceipt
  );
  router.delete(
    "/api/receipt/delete",
    // middlewareControllers.verifyTokenAdmin,
    receiptController.deleteReceipt
  );

  //---------------------------API SHOP-CART------------------------------//
  router.post("/api/shop-cart/add", shopCartController.addShopCart);
  router.put("/api/shop-cart/update", shopCartController.updateShopCart);
  router.get(
    "/api/shop-cart/by-user-id",
    shopCartController.getShopCartByUserId
  );
  router.delete("/api/shop-cart/delete", shopCartController.deleteItem);

  //---------------------------API ADDRESS-USER------------------------------//
  router.post(
    "/api/address-user/create",
    // middlewareControllers.verifyTokenUser,
    addressUserController.createAddressUser
  );
  router.get(
    "/api/address-user",
    // middlewareControllers.verifyTokenUser,
    addressUserController.getAllAddressUser
  );
  router.delete(
    "/api/address-user/delete",
    // middlewareControllers.verifyTokenUser,
    addressUserController.deleteAddressUser
  );
  router.put(
    "/api/address-user/edit",
    // middlewareControllers.verifyTokenUser,
    addressUserController.editAddressUser
  );
  router.get(
    "/api/address-user/get-by-id",
    // middlewareControllers.verifyTokenUser,
    addressUserController.getAddressUserById
  );
  //---------------------------API ORDER------------------------------//
  router.post(
    "/api/order/create",
    // middlewareControllers.verifyTokenUser,
    orderController.createOrder
  );
  router.get("/api/order", orderController.getAllOrders);
  router.get("/api/order/get-by-id", orderController.getOrderById);
  router.put(
    "/api/order/update-status",
    // middlewareControllers.verifyTokenUser,
    orderController.updateStatusOrder
  );
  router.get(
    "/api/order/get-all-by-user",
    // middlewareControllers.verifyTokenUser,
    orderController.getAllOrdersByUser
  );
  router.get(
    "/api/order/get-all-by-shipper",
    orderController.getAllOrdersByShipper
  );
  router.post(
    "/api/order/payment-vnpay",
    // middlewareControllers.verifyTokenUser,
    orderController.paymentOrderVNPay
  );
  router.post("/api/order/vnpay-return", orderController.confirmOrderVNPay);
  router.post(
    "/api/order/payment-vnpay-success",
    // middlewareControllers.verifyTokenUser,
    orderController.paymentOrderVNPaySuccess
  );
  router.put("/api/order/confirm", orderController.confirmOrder);

  //---------------------------API STATISTIC------------------------------//
  router.get(
    "/api/statistic/count-card",
    // middlewareControllers.verifyTokenAdmin,
    statisticController.getCountCardStatistic
  );
  router.get(
    "/api/statistic/count-status-order",
    // middlewareControllers.verifyTokenAdmin,
    statisticController.getCountStatusOrder
  );
  router.get(
    "/api/statistic/by-month",
    // middlewareControllers.verifyTokenAdmin,
    statisticController.getStatisticByMonth
  );
  router.get(
    "/api/statistic/by-day",
    // middlewareControllers.verifyTokenAdmin,
    statisticController.getStatisticByDay
  );
  router.get(
    "/api/statistic/profit",
    // middlewareControllers.verifyTokenAdmin,
    statisticController.getStatisticProfit
  );
  router.get(
    "/api/statistic/overturn",
    // middlewareControllers.verifyTokenAdmin,
    statisticController.getStatisticOverturn
  );
  router.get(
    "/api/statistic/stock-product",
    // middlewareControllers.verifyTokenAdmin,
    statisticController.getStatisticStockProduct
  );

  app.use("/", router);
};

module.exports = webRoutes;
