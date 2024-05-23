import db from "../models/index";
import {
  successResponse,
  errorResponse,
  missingRequiredParams,
  notFound,
} from "../utils/ResponseUtils";

const calculateStock = async (sizeId, orderDetails) => {
  try {
    // Find all receipt details for the specified sizeId
    const receiptDetails = await db.ReceiptDetail.findAll({
      where: { sizeId },
    });

    // Calculate total quantity from receipt details
    let totalQuantity = 0;
    for (const receipt of receiptDetails) {
      totalQuantity += receipt.quantity;
    }

    // Subtract quantities from orders if orderDetails exist
    if (Array.isArray(orderDetails)) {
      for (const order of orderDetails) {
        if (order && order.statusId !== "S3" && order.sizeId === sizeId) {
          // S7: hủy đơn
          totalQuantity -= order.quantity;
        }
      }
    }

    return totalQuantity;
  } catch (error) {
    console.error("Error calculating stock:", error);
    throw new Error("Error calculating stock");
  }
};

const addShopCart = async (data, orderDetails) => {
  try {
    if (!data.userId || !data.sizeId || !data.quantity) {
      return missingRequiredParams("user, size, quantity are");
    }

    const stock = await calculateStock(data.sizeId, orderDetails);
    if (+data.quantity > stock) {
      return errorResponse(`Chỉ còn ${stock} sản phẩm`, 2, stock);
    } else {
      await db.ShopCart.create({
        userId: data.userId,
        sizeId: data.sizeId,
        quantity: data.quantity,
        statusId: 0,
      });
      return successResponse("Add items into shop cart");
    }
  } catch (error) {
    console.error("Error in addShopCart:", error);
    return errorResponse(error.message);
  }
};

const updateShopCart = async (data, orderDetails) => {
  try {
    const { userId, sizeId, quantity } = data;
    if (!userId || !sizeId || !quantity) {
      return missingRequiredParams("user, size, quantity are");
    }

    const stock = await calculateStock(sizeId, orderDetails);
    if (+quantity > stock) {
      return errorResponse(`Chỉ còn ${stock} sản phẩm`, 2, stock);
    }
    let [updatedRowsCount] = await db.ShopCart.update(
      { quantity },
      {
        where: {
          userId,
          sizeId,
          statusId: 0, // Giỏ hàng chưa thanh toán
        },
      }
    );

    if (updatedRowsCount === 0) {
      await db.ShopCart.create({
        userId,
        sizeId,
        quantity,
        statusId: 0,
      });
      return successResponse("Add items into shop cart");
    }

    return successResponse("Update shop cart successfully");
  } catch (error) {
    console.error("Error in updateShopCart:", error);
    return errorResponse("Error from server");
  }
};

const getShopCartByUserId = async (userId) => {
  if (!userId) {
    return missingRequiredParams("userId");
  }

  try {
    const shopCartItems = await db.ShopCart.findAll({
      where: { userId },
      raw: true,
    });

    if (shopCartItems.length === 0) {
      return notFound(
        `No shop cart items found for the user with userId ${userId}`
      );
    }

    const productDetailsPromises = shopCartItems.map(async (item) => {
      const productSize = await db.ProductSize.findOne({
        where: { id: item.sizeId },
        include: [
          {
            model: db.ProductDetail,
            as: "productDetailData",
            include: [
              {
                model: db.Product,
                as: "productData",
                attributes: ["id", "name"],
              },
              {
                model: db.ProductImage,
                as: "productImageData",
                attributes: ["image"],
              },
            ],
            attributes: [
              "id",
              "productId",
              "color",
              "originalPrice",
              "discountPrice",
            ],
          },
        ],
        attributes: ["id", "productDetailId", "sizeId"],
        raw: true,
        nest: true,
      });

      if (!productSize || !productSize.productDetailData) {
        return { ...item, productDetailNotFound: true };
      }

      const { productDetailData } = productSize;
      const total = item.quantity * productDetailData.discountPrice;

      return {
        ...item,
        productId: productDetailData.productData.id,
        name: productDetailData.productData.name,
        image:
          productDetailData.productImageData.length > 0
            ? productDetailData.productImageData[0].image
            : "No image available",
        color: productDetailData.color,
        originalPrice: productDetailData.originalPrice,
        discountPrice: productDetailData.discountPrice,
        size: productSize.sizeId,
        total,
      };
    });

    const productDetails = await Promise.all(productDetailsPromises);

    return {
      result: productDetails,
      statusCode: 200,
      errors: [`Get shop cart by userId = ${userId} successfully!`],
    };
  } catch (error) {
    console.error("Error in getShopCartByUserId:", error);
    return errorResponse(error.message);
  }
};

const deleteItem = async (data) => {
  try {
    if (!data.id) {
      return errorResponse("Missing required parameter!");
    }
    const res = await db.ShopCart.findOne({
      where: { id: data.id, statusId: 0 },
    });
    if (res) {
      await db.ShopCart.destroy({ where: { id: data.id } });
      return successResponse("ok");
    }
  } catch (error) {
    console.error("Error in deleteItem:", error);
    return errorResponse("Failed to delete item from shop cart");
  }
};

export default { addShopCart, updateShopCart, getShopCartByUserId, deleteItem };
