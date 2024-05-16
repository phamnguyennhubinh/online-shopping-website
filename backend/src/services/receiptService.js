import db from "../models/index";
const { Op } = require("sequelize");
const {
  successResponse,
  errorResponse,
  notFound,
} = require("../utils/ResponseUtils");

const createReceipt = async (data) => {
  try {
    const { userId, supplierId, sizeId, quantity, price } = data;
    if (!userId || !supplierId || !sizeId || !quantity || !price) {
      return errorResponse("Missing required parameters!", 400);
    }

    const receipt = await db.Receipt.create({ userId, supplierId });
    if (receipt) {
      await db.ReceiptDetail.create({
        receiptId: receipt.id,
        sizeId,
        quantity,
        price,
      });
    }

    return successResponse("Receipt created");
  } catch (error) {
    console.error("Error in createReceipt:", error);
    return errorResponse("Failed to create receipt", 500);
  }
};

const getReceiptById = async (id) => {
  try {
    if (!id) {
      return errorResponse("Missing required parameter!");
    }
    const receipt = await db.Receipt.findOne({ where: { id } });

    if (!receipt) {
      return notFound(`Receipt ${id} not found`);
    }

    const supplier = await db.Supplier.findOne({
      where: { id: receipt.supplierId },
      attributes: ["email", "name"],
    });

    if (!supplier) {
      return notFound(`Supplier for receipt ${id} not found`);
    }
    const receiptDetails = await db.ReceiptDetail.findAll({
      where: { receiptId: receipt.id },
      attributes: ["sizeId", "quantity"],
    });
    const getProductDetails = async (sizeIds) => {
      const productDetails = [];
      for (const detail of sizeIds) {
        const productSize = await db.ProductSize.findOne({
          where: { id: detail.sizeId },
          attributes: ["productDetailId"],
        });
        if (productSize) {
          const productDetail = await db.ProductDetail.findOne({
            where: { id: productSize.productDetailId },
            attributes: ["productId", "id"],
          });
          if (productDetail && productDetail.productId) {
            productDetails.push({
              productId: productDetail.productId,
              productDetailId: productDetail.id,
            });
          } else {
            console.error(
              "ProductId or productDetail not found for sizeId::",
              detail.sizeId
            );
            productDetails.push({
              productId: null,
              productDetailId: null,
            });
          }
        } else {
          console.error("ProductSize not found for sizeId:", detail.sizeId);
          productDetails.push({
            productId: null,
            productDetailId: null,
          });
        }
      }
      return productDetails;
    };
    const sizeIds = receiptDetails.map((detail) => ({
      sizeId: detail.sizeId,
    }));
    const productDetails = await getProductDetails(sizeIds);

    const formattedReceipt = {
      id: receipt.id,
      supplier: {
        email: supplier.email,
        name: supplier.name,
      },
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
      products: [],
    };
    receiptDetails.forEach((detail, index) => {
      formattedReceipt.products.push({
        productId: productDetails[index].productId,
        productDetailId: productDetails[index].productDetailId,
        quantity: detail.quantity,
        sizeId: detail.sizeId,
      });
    });

    return {
      result: [formattedReceipt],
      statusCode: 200,
      errors: [`Get receipt with id = ${id} successfully!`],
    };
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

const getAllReceipt = async (data) => {
  try {
    let objectFilter = {};
    if (data.limit && data.offset) {
      objectFilter.limit = +data.limit;
      objectFilter.offset = +data.offset;
    }
    const receipts = await db.Receipt.findAndCountAll(objectFilter);
    const receiptData = [];
    for (let i = 0; i < receipts.rows.length; i++) {
      const receipt = receipts.rows[i];
      const supplierData = await db.Supplier.findOne({
        where: { id: receipt.supplierId },
        attributes: ["email", "name"],
      });
      const formattedReceipt = {
        receipt: {
          id: receipt.id,
          supplier: {
            email: supplierData.email,
            name: supplierData.name,
          },
          createdAt: receipt.createdAt,
          updatedAt: receipt.updatedAt,
          receiptDetails: [],
        },
      };
      const receiptDetails = await db.ReceiptDetail.findAll({
        where: { receiptId: receipt.id },
        attributes: ["sizeId", "quantity"],
      });
      const getProductDetails = async (sizeIds) => {
        const productDetails = [];
        for (const detail of sizeIds) {
          const productSize = await db.ProductSize.findOne({
            where: { id: detail.sizeId },
            attributes: ["productDetailId"],
          });
          if (productSize) {
            const productDetail = await db.ProductDetail.findOne({
              where: { id: productSize.productDetailId },
              attributes: ["productId", "id"],
            });
            if (productDetail && productDetail.productId) {
              productDetails.push({
                productId: productDetail.productId,
                productDetailId: productDetail.id,
              });
            } else {
              console.error(
                "ProductId or productDetail not found for sizeId::",
                detail.sizeId
              );
              productDetails.push({
                productId: null,
                productDetailId: null,
              });
            }
          } else {
            console.error("ProductSize not found for sizeId:", detail.sizeId);
            productDetails.push({
              productId: null,
              productDetailId: null,
            });
          }
        }
        return productDetails;
      };
      const sizeIds = receiptDetails.map((detail) => ({
        sizeId: detail.sizeId,
      }));
      const productDetails = await getProductDetails(sizeIds);

      receiptDetails.forEach((detail, index) => {
        formattedReceipt.receipt.receiptDetails.push({
          productId: productDetails[index].productId,
          productDetailId: productDetails[index].productDetailId,
          quantity: detail.quantity,
          sizeId: detail.sizeId,
        });
      });
      receiptData.push(formattedReceipt);
    }
    return {
      result: receiptData,
      statusCode: 200,
      errors: ["Get all receipts successfully!"],
    };
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

const updateReceipt = async (data) => {
  try {
    const { id, userId, supplierId } = data;
    if (!id || !userId || !supplierId) {
      return errorResponse("id, userId, supplierId are required");
    }

    const [updatedRowsCount] = await db.Receipt.update(
      { supplierId },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      return notFound("Receipt not found");
    }

    return successResponse("Receipt updated");
  } catch (error) {
    console.error("Error in updateReceipt:", error);
    return errorResponse("Failed to update receipt");
  }
};

const deleteReceipt = async (data) => {
  try {
    const { id } = data;
    if (!id) {
      return errorResponse("Missing required parameter!");
    }

    let receipt = await db.Receipt.findOne({ where: { id } });
    if (!receipt) {
      return notFound("Receipt not found");
    }

    await db.Receipt.destroy({ where: { id } });

    return successResponse("Receipt deleted");
  } catch (error) {
    console.error("Error in deleteReceipt:", error);
    return errorResponse("Failed to delete receipt");
  }
};

export default {
  createReceipt,
  getReceiptById,
  getAllReceipt,
  updateReceipt,
  deleteReceipt,
};
