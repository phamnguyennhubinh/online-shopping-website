import db from "../models/index";
const fs = require("fs").promises;
const path = require("path");
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
      return missingRequiredParams("user, size, quantity are required");
    }

    // Calculate the available stock for the specified sizeId
    const stock = await calculateStock(data.sizeId, orderDetails);
    if (+data.quantity > stock) {
      return errorResponse(`Chỉ còn ${stock} sản phẩm`, 2, stock);
    } else {
      // Find the productDetail associated with the sizeId
      const productSize = await db.ProductSize.findOne({
        where: { id: data.sizeId },
        include: [
          {
            model: db.ProductDetail,
            as: "productDetailData",
            attributes: ["productId"],
          },
        ],
        raw: true,
        nest: true,
      });

      if (!productSize) {
        return errorResponse(
          `Product size not found for sizeId: ${data.sizeId}`
        );
      }

      // Add the item to the shopping cart
      const shopCartItem = await db.ShopCart.create({
        userId: data.userId,
        sizeId: data.sizeId,
        quantity: data.quantity,
        statusId: 0,
      });

      // Return success response with productId and sizeId
      return {
        result: {
          userId: data.userId,
          sizeId: data.sizeId,
          productId: productSize.productDetailData.productId,
          quantity: data.quantity,
          statusId: 0,
        },
        statusCode: 200,
        errors: ["Add items into shop cart successfully!"],
      };
    }
  } catch (error) {
    console.error("Error in addShopCart:", error);
    return errorResponse(error.message);
  }
};

const updateShopCart = async (data, orderDetails) => {
  try {
    const { itemId, userId, sizeId, quantity } = data;

    if (!itemId || !userId || !sizeId || !quantity) {
      return missingRequiredParams(
        "itemId, userId, sizeId, and quantity are required."
      );
    }

    const stock = await calculateStock(sizeId, orderDetails);

    if (+quantity > stock) {
      return errorResponse(`Only ${stock} items left in stock.`, 2, stock);
    }

    const [updatedRowsCount, updatedShopCart] = await db.ShopCart.update(
      { quantity, sizeId },
      {
        where: {
          userId,
          id: itemId,
          statusId: 0,
        },
        returning: true, // Ensure it returns the updated row
      }
    );

    if (updatedRowsCount === 0) {
      const newCartItem = await db.ShopCart.create({
        userId,
        sizeId,
        quantity,
        statusId: 0,
      });

      return successResponse(
        "Item added to the shopping cart successfully.",
        newCartItem
      );
    }

    return successResponse(
      "Shopping cart updated successfully.",
      updatedShopCart
    );
  } catch (error) {
    console.error("Error in updateCartItem:", error);
    return errorResponse("Error updating shopping cart.");
  }
};

// const getShopCartByUserId = async (userId) => {
//   if (!userId) {
//     return missingRequiredParams("userId");
//   }

//   try {
//     const shopCartItems = await db.ShopCart.findAll({
//       where: { userId },
//       raw: true,
//     });

//     if (shopCartItems.length === 0) {
//       return notFound(
//         `No shop cart items found for the user with userId ${userId}`
//       );
//     }

//     const productDetailsPromises = shopCartItems.map(async (item) => {
//       const productSize = await db.ProductSize.findOne({
//         where: { id: item.sizeId },
//         include: [
//           {
//             model: db.ProductDetail,
//             as: "productDetailData",
//             include: [
//               {
//                 model: db.Product,
//                 as: "productData",
//                 attributes: ["id", "name"],
//               },
//               {
//                 model: db.ProductImage,
//                 as: "productImageData",
//                 attributes: ["image"],
//               },
//             ],
//             attributes: [
//               "id",
//               "productId",
//               "color",
//               "originalPrice",
//               "discountPrice",
//             ],
//           },
//         ],
//         attributes: ["id", "productDetailId", "sizeId"],
//         raw: true,
//         nest: true,
//       });

//       if (!productSize || !productSize.productDetailData) {
//         return { ...item, productDetailNotFound: true };
//       }

//       const { productDetailData } = productSize;
//       const total = item.quantity * productDetailData.discountPrice;

//       return {
//         ...item,
//         productId: productDetailData.productData.id,
//         name: productDetailData.productData.name,
//         image:
//           productDetailData.productImageData.length > 0
//             ? productDetailData.productImageData[0].image
//             : null,
//         color: productDetailData.color,
//         originalPrice: productDetailData.originalPrice,
//         discountPrice: productDetailData.discountPrice,
//         size: productSize.sizeId,
//         total,
//       };
//     });

//     const productDetails = await Promise.all(productDetailsPromises);

//     return {
//       result: productDetails,
//       statusCode: 200,
//       errors: [`Get shop cart by userId = ${userId}!`],
//     };
//   } catch (error) {
//     console.error("Error in getShopCartByUserId:", error);
//     return errorResponse(error.message);
//   }
// };

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

      // Fetch additional data for colors
      const colors = await db.sequelize.query(
        `
        SELECT all_codes.*
        FROM product_details
        LEFT JOIN all_codes
        ON product_details.color = all_codes.code
        WHERE product_details.productId = ${productDetailData.productId}
        `,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      // Fetch images for the product
      const images = await db.ProductImage.findAll({
        where: {
          productDetailId: productDetailData.id,
        },
        attributes: ["image"],
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
            return {
              image: `data:image/jpeg;base64,${imageData}`,
            };
          } catch (error) {
            console.error("Error converting image to base64:", error);
            return null; // Return null for failed conversions
          }
        })
      ).then((results) => results.filter((result) => result !== null));

      const total = item.quantity * productDetailData.discountPrice;

      return {
        ...item,
        id: productDetailData.productId,
        name: productDetailData.productData.name,
        colors,
        images: imagesBase64,
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
      errors: [`Get shop cart by userId = ${userId}!`],
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
