import db from "../models/index";
import {
  successResponse,
  errorResponse,
  missingRequiredParams,
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
        if (order && order.statusId !== "S7" && order.sizeId === sizeId) {
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
  try {
    if (!userId) {
      missingRequiredParams("userId");
    }

    const shopCartItems = await db.ShopCart.findAll({
      where: { userId: userId, statusId: 0 },
      raw: true,
    });

    if (!shopCartItems || shopCartItems.length === 0) {
      return {
        result: [],
        statusCode: 404,
        errors: [`No shop cart items found for the user with userId ${userId}`],
      };
    }
    const productDetailPromises = shopCartItems.map(async (item) => {
      const productDetail = await db.ProductDetail.findOne({
        where: { id: item.sizeId },
        include: [
          {
            model: db.Product,
            as: "productData",
            attributes: ["name"],
          },
          {
            model: db.ProductImage,
            as: "productImageData",
            attributes: ["image"],
          },
          { model: db.ProductSize, as: "sizeData", attributes: ["sizeId"] },
        ],
        raw: true,
      });
      return productDetail;
    });

    const productDetails = await Promise.all(productDetailPromises);

    const data = shopCartItems.map((item, index) => {
      const productDetail = productDetails[index];
      if (!productDetail) {
        return null;
      }

      return {
        id: item.id,
        userId: item.userId,
        sizeId: item.sizeId,
        sideData: productDetail["sizeData.sizeId"],
        quantity: item.quantity,
        productId: productDetail.productId,
        name: productDetail["productData.name"],
        image: productDetail["productImageData.image"],
        color: productDetail.color,
        originalPrice: productDetail.originalPrice,
        discountPrice: productDetail.discountPrice,
      };
    });

    return {
      result: data.filter((item) => item !== null),
      statusCode: 200,
      errors: [`Get shop cart of user with id = ${userId} successfully!`],
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
