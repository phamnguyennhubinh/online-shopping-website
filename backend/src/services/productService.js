import db from "../models/index";
import jsrecommender from "js-recommender";
require("dotenv").config();
const { Op } = require("sequelize");
const fs = require("fs").promises;
const path = require("path");
import {
  successResponse,
  errorResponse,
  missingRequiredParams,
  notFound,
} from "../utils/ResponseUtils";

function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    var result =
      a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    return result * sortOrder;
  };
}

function dynamicSortMultiple() {
  var props = arguments;
  return function (obj1, obj2) {
    var i = 0,
      result = 0,
      numberOfProperties = props.length;
    /* try getting a different result from 0 (equal)
     * as long as we have extra properties to compare
     */
    while (result === 0 && i < numberOfProperties) {
      result = dynamicSort(props[i])(obj1, obj2);
      i++;
    }
    return result;
  };
}
function getSizeDetails(size) {
  switch (size.toUpperCase()) {
    case "S":
      return { height: "1m60-1m65", weight: "55kg-60kg" };
    case "M":
      return { height: "1m64-1m69", weight: "60kg-65kg" };
    case "L":
      return { height: "1m70-1m74", weight: "66kg-70kg" };
    case "XL":
      return { height: "1m74-1m76", weight: "70kg-76kg" };
    case "XXL":
      return { height: "1m66-1m77", weight: "76kg-80kg" };
    default:
      return null;
  }
}
// PRODUCT
const createProduct = async (data) => {
  try {
    // Check for missing required parameters
    if (!data.categoryId || !data.brandId) {
      return missingRequiredParams("Category, Brand are");
    }
    // Create product
    const arrayColor = data.color.split(",").map((item) => item.trim());
    const product = await db.Product.create({
      name: data.name,
      content: data.content,
      statusId: data.statusId,
      categoryId: data.categoryId,
      brandId: data.brandId,
    });
    // Check if product creation was successful
    if (!product) {
      return errorResponse(error.message);
    }
    // Create product detail
    const productDetails = [];

    for (const color of arrayColor) {
      try {
        const productDetail = await db.ProductDetail.create({
          productId: product.id,
          color: color,
          originalPrice: data.originalPrice,
          discountPrice: data.discountPrice,
        });
        productDetails.push(productDetail);
      } catch (error) {
        console.error("Error creating product detail:", error);
      }
    }

    // Check if product detail creation was successful
    if (!productDetails) {
      return errorResponse(error.message);
    }
    const arraySize = data.size.split(",").map((item) => item.trim());
    for (const size of arraySize) {
      try {
        const sizeInfo = getSizeDetails(size);
        await db.ProductSize.create({
          productDetailId: product.id,
          height: sizeInfo.height,
          weight: sizeInfo.weight,
          sizeId: size,
        });
      } catch (error) {
        console.error("Error creating product detail:", error);
      }
    }

    const imagePaths = await uploadFiles(data.files);
    await saveProductImages(product.id, imagePaths);

    return successResponse("Product created");
  } catch (error) {
    console.error("Error creating product:", error);
    return errorResponse(error.message);
  }
};

const getAllProductAdmin = async (data) => {
  try {
    let objectFilter = {
      include: [
        {
          model: db.AllCode,
          as: "categoryData",
          attributes: ["value", "code"],
        },
        {
          model: db.ProductDetail,
          as: "productDetailData",
          attributes: ["originalPrice", "discountPrice"],
          include: [
            {
              model: db.ProductImage,
              as: "productImageData",
              attributes: ["image"],
            },
          ],
        },
        {
          model: db.AllCode,
          as: "brandData",
          attributes: ["value", "code"],
        },
        {
          model: db.AllCode,
          as: "statusData",
          attributes: ["value", "code"],
        },
      ],
      attributes: ["id", "name", "categoryId", "view"],
      raw: true,
      nest: true,
    };
    // Filtering and sorting conditions
    if (data.limit && data.offset) {
      objectFilter.limit = +data.limit;
      objectFilter.offset = +data.offset;
    }
    if (data.categoryId && data.categoryId !== "ALL") {
      objectFilter.where.categoryId = data.categoryId;
    }
    if (data.brandId && data.brandId !== "ALL") {
      objectFilter.where.brandId = data.brandId;
    }
    if (data.statusId && data.statusId !== "ALL") {
      objectFilter.where.statusId = data.statusId;
    }
    if (data.sortName === "true") {
      objectFilter.order = [["name", "ASC"]];
    }
    if (data.keyword && data.keyword !== "") {
      objectFilter.where.name = { [Op.substring]: data.keyword };
    }
    let res = await db.Product.findAndCountAll(objectFilter);
    if (data.sortPrice && data.sortPrice === "true") {
      res.rows.sort(dynamicSortMultiple("price"));
    }
    const productsById = {};
    res.rows.forEach((product) => {
      const productId = product.id;
      if (!productsById[productId]) {
        productsById[productId] = {
          id: product.id,
          name: product.name,
          category: product.categoryData.value,
          view: product.view,
          brand: product.brandData ? product.brandData.value : "",
          status: product.statusData ? product.statusData.value : "",
          images: [],
          originalPrice: product.productDetailData.originalPrice || "",
          discountPrice: product.productDetailData.discountPrice || "",
        };
      }
      if (product.productDetailData.productImageData) {
        productsById[productId].images.push({
          id: product.productDetailData.productImageData.id,
          image: product.productDetailData.productImageData.image,
        });
      }
    });
    const productsWithDetails = Object.values(productsById);
    return {
      result: productsWithDetails,
      statusCode: 200,
      errors: ["Get all products by user successfully!"],
    };
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

const getAllProductUser = async (data) => {
  try {
    let objectFilter = {
      where: { statusId: "S1" },
      include: [
        {
          model: db.AllCode,
          as: "categoryData",
          attributes: ["value", "code"],
        },
        {
          model: db.ProductDetail,
          as: "productDetailData",
          attributes: ["originalPrice", "discountPrice"],
          include: [
            {
              model: db.ProductImage,
              as: "productImageData",
              attributes: ["image"],
            },
          ],
        },
        {
          model: db.AllCode,
          as: "brandData",
          attributes: ["value", "code"],
        },
      ],
      attributes: ["id", "name", "categoryId", "view"],
      raw: true,
      nest: true,
    };
    // Filtering and sorting conditions
    if (data.limit && data.offset) {
      objectFilter.limit = +data.limit;
      objectFilter.offset = +data.offset;
    }
    if (data.categoryId && data.categoryId !== "ALL") {
      objectFilter.where.categoryId = data.categoryId;
    }
    if (data.brandId && data.brandId !== "ALL") {
      objectFilter.where.brandId = data.brandId;
    }
    if (data.sortName === "true") {
      objectFilter.order = [["name", "ASC"]];
    }
    if (data.keyword && data.keyword !== "") {
      objectFilter.where.name = { [Op.substring]: data.keyword };
    }
    let res = await db.Product.findAndCountAll(objectFilter);
    if (data.sortPrice && data.sortPrice === "true") {
      res.rows.sort(dynamicSortMultiple("price"));
    }
    const productsById = {};
    res.rows.forEach((product) => {
      const productId = product.id;
      if (!productsById[productId]) {
        productsById[productId] = {
          id: product.id,
          name: product.name,
          category: product.categoryData.value,
          view: product.view,
          brand: product.brandData ? product.brandData.value : "",
          status: product.statusData ? product.statusData.value : "",
          images: [],
          originalPrice: product.productDetailData.originalPrice || "",
          discountPrice: product.productDetailData.discountPrice || "",
        };
      }
      if (product.productDetailData.productImageData) {
        productsById[productId].images.push({
          id: product.productDetailData.productImageData.id,
          image: product.productDetailData.productImageData.image,
        });
      }
    });
    const productsWithDetails = Object.values(productsById);

    return {
      result: productsWithDetails,
      statusCode: 200,
      errors: ["Get all products by user successfully!"],
    };
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

const getProductById = async (data) => {
  try {
    if (!data || !data.id) {
      return missingRequiredParams("id is");
    }

    const { id } = data;

    // Fetch product details with associated data
    const productDetails = await db.ProductDetail.findAndCountAll({
      include: [
        {
          model: db.ProductImage,
          as: "productImageData",
          attributes: ["id", "image"],
        },
        { model: db.ProductSize, as: "sizeData", attributes: ["id", "sizeId"] },
        {
          model: db.Product,
          as: "productData",
          attributes: ["name", "content", "view", "statusId"],
          include: [
            {
              model: db.AllCode,
              as: "brandData",
              attributes: ["value", "code"],
            },
            {
              model: db.AllCode,
              as: "categoryData",
              attributes: ["value", "code"],
            },
          ],
          where: { id: id },
        },
      ],
      attributes: ["color", "originalPrice", "discountPrice"],
      raw: true,
      nest: true,
    });

    const colors = await db.sequelize.query(
      `
    SELECT all_codes.* FROM product_details left join all_codes on product_details.color = all_codes.code where productId = ${data.id}
    `,
      { type: db.sequelize.QueryTypes.SELECT }
    );

    const images = await db.sequelize.query(
      `
    SELECT image FROM product_images where productDetailId = ${data.id}
  `,
      { type: db.sequelize.QueryTypes.SELECT }
    );

    const sizes = await db.sequelize.query(
      `
    SELECT * FROM product_sizes where productDetailId = ${data.id}
  `,
      { type: db.sequelize.QueryTypes.SELECT }
    );
    // If no product details found, return error
    if (!productDetails.rows.length) {
      return notFound("Product details");
    }

    // Extract common properties from the first product detail
    const firstProductDetail = productDetails.rows[0];
    const {
      originalPrice,
      discountPrice,
      productData: { name, content, view, brandData, categoryData, statusId },
    } = firstProductDetail;

    // Iterate through each product detail
    productDetails.rows.forEach((productDetail) => {
      // Push image to the array if it exists
      if (
        productDetail.productImageData &&
        productDetail.productImageData.image &&
        !images.some((image) => image.id === productDetail.productImageData.id)
      ) {
        images.push({
          id: productDetail.productImageData.id,
          name: productDetail.productImageData.image,
        });
      }
    });

    const imagesBase64 = [];
    try {
      for (const img of images) {
        const imagePath = path.join(__dirname, "../..", "uploads", img.image);
        await fs.stat(imagePath);
        const data = await fs.readFile(imagePath);
        const imageData = data.toString("base64");
        const imageBase64 = `data:image/jpeg;base64,${imageData}`;
        imagesBase64.push({
          image: imageBase64,
        });
      }
    } catch (error) {
      return errorResponse(error.message);
    }
    return {
      result: {
        id,
        name,
        content,
        view,
        originalPrice,
        discountPrice,
        brand: brandData,
        category: categoryData,
        images: imagesBase64,
        statusId,
        sizes,
        colors,
      },
      statusCode: 200,
      errors: ["Get all product details successfully!"],
    };
  } catch (error) {
    console.error("Error retrieving product details:", error);
    return errorResponse(error.message);
  }
};

const inActiveProduct = async (data) => {
  try {
    if (!data.id) {
      return missingRequiredParams("id is");
    }
    let product = await db.Product.findOne({
      where: { id: data.id },
      raw: false,
    });
    if (!product) {
      return notFound("Product");
    }
    product.statusId = "S2";
    await product.save();
    return successResponse(`Product with id = ${data.id} deactivated`);
  } catch (error) {
    console.log(error);
    return errorResponse(error.message);
  }
};

const activeProduct = async (data) => {
  try {
    if (!data.id) {
      return missingRequiredParams("id is");
    }
    let product = await db.Product.findOne({
      where: { id: data.id },
      raw: false,
    });
    if (!product) {
      return notFound("Product");
    }
    product.statusId = "S1";
    await product.save();
    return successResponse(`Product with id = ${data.id} activated`);
  } catch (error) {
    console.log(error);
    return errorResponse(error.message);
  }
};

const updateProduct = async (data) => {
  console.log(data.productId);
  try {
    // Check if productId is provided
    if (!data.productId) {
      return missingRequiredParams("productId is");
    }

    // Check if product exists
    const product = await db.Product.findOne({ where: { id: data.productId } });
    if (!product) {
      return notValid("Product not found");
    }

    // Update product
    await db.Product.update(
      {
        name: data.name,
        content: data.content,
        statusId: data.statusId,
        categoryId: data.categoryId,
        brandId: data.brandId,
      },
      { where: { id: data.productId } }
    );

    // Update product details
    let ProductDetails = await db.ProductDetail.findAll({
      where: { productId: data.productId },
    });
    if (ProductDetails.length > 0) {
      await db.ProductDetail.destroy({
        where: { productId: data.productId },
      });
    }
    const arrayColor = data.color.split(/[,]/);
    for (const color of arrayColor) {
      try {
        await db.ProductDetail.create({
          productId: data.productId,
          color: color,
          originalPrice: data.originalPrice,
          discountPrice: data.discountPrice,
        });
        // productDetails.push(productDetail);
      } catch (error) {
        console.error("Error creating product detail:", error);
      }
    }

    let productSize = await db.ProductSize.findAll({
      where: { productDetailId: data.productId },
    });

    if (productSize.length > 0) {
      await db.ProductSize.destroy({
        where: { productDetailId: data.productId },
      });
    }
    const arraySize = data.size.split(/[,]/);
    console.log(arraySize);
    for (const size of arraySize) {
      try {
        const sizeInfo = getSizeDetails(size);
        await db.ProductSize.create({
          productDetailId: data.productId,
          height: sizeInfo.height,
          weight: sizeInfo.weight,
          sizeId: size,
        });
      } catch (error) {
        console.error("Error creating product detail:", error);
      }
    }

    // Upload and save new product images if files are provided
    if (data.files) {
      let productImgs = await db.ProductImage.findAll({
        where: { productDetailId: data.productId },
      });
      if (productImgs.length > 0) {
        await db.ProductImage.destroy({
          where: { productDetailId: data.productId },
        });
      }
      const imagePaths = await uploadFiles(data.files);
      await saveProductImages(data.productId, imagePaths);
    }

    return successResponse("Product updated");
  } catch (error) {
    console.error("Error updating product:", error);
    return errorResponse(error.message);
  }
};

const deleteProduct = async (productId) => {
  try {
    if (!productId) {
      return missingRequiredParams("Product ID is");
    }
    await db.sequelize.transaction(async (transaction) => {
      const product = await db.Product.findOne({
        where: { id: productId },
        transaction,
      });
      if (!product) {
        return notFound("Product");
      }
      const productDetails = await db.ProductDetail.findAll({
        where: { productId },
        transaction,
      });
      const productDetailIds = productDetails.map((detail) => detail.id);
      await db.ProductImage.destroy({
        where: { productDetailId: productDetailIds },
        transaction,
      });
      await db.ProductSize.destroy({
        where: { productDetailId: productId },
      });
      await db.ProductDetail.destroy({ where: { productId }, transaction });
      await db.Product.destroy({ where: { id: productId }, transaction });
    });

    return successResponse("Delete product successfully");
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

// PRODUCT DETAIL
const createProductDetail = async (data) => {
  try {
    if (
      !data.color ||
      !data.originalPrice ||
      !data.discountPrice ||
      !data.productId
    ) {
      return missingRequiredParams(
        "color, originalPrice, discountPrice, product are"
      );
    }
    const productDetail = await db.ProductDetail.create({
      productId: data.productId,
      color: data.color,
      originalPrice: data.originalPrice,
      discountPrice: data.discountPrice,
    });
    if (!productDetail) {
      return errorResponse("Failed to create new product detail");
    }
    return successResponse("Created new product detail");
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

const getProductDetailById = async (id) => {
  try {
    if (!id) {
      return missingRequiredParams("id is");
    }
    let productDetail = await db.ProductDetail.findOne({
      where: { id: id },
    });
    if (!productDetail) {
      return notFound("Product detail");
    }
    return {
      result: [productDetail],
      statusCode: 200,
      errors: [`Get product detail with id = ${id} successfully!`],
    };
  } catch (error) {
    console.log(error);
    return errorResponse(error.message);
  }
};

const updateProductDetail = async (data) => {
  try {
    if (!data.originalPrice || !data.discountPrice || !data.id) {
      return missingRequiredParams("originalPrice, discountPrice, id are");
    }
    let productDetail = await db.ProductDetail.findOne({
      where: { id: data.id },
      raw: false,
    });
    if (!productDetail) {
      return notFound("Product detail");
    }
    if (
      (productDetail.originalPrice === data.originalPrice &&
        productDetail.discountPrice === data.discountPrice) ||
      productDetail.color === data.color
    ) {
      return {
        result: [],
        statusCode: 200,
        errors: ["No changes detected. Product detail not updated."],
      };
    }
    productDetail.originalPrice = data.originalPrice;
    productDetail.discountPrice = data.discountPrice;
    productDetail.color = data.color;
    await productDetail.save();

    return {
      result: productDetail,
      statusCode: 200,
      errors: ["Product detail updated successfully"],
    };
  } catch (error) {
    console.error("Error updating product detail:", error);
    return errorResponse("Failed to update product detail");
  }
};

const deleteProductDetail = async (data) => {
  try {
    if (!data.id) {
      return missingRequiredParams("id is");
    }
    let productDetails = await db.ProductDetail.findAll({
      where: { productId: data.id },
    });
    if (productDetails.length > 0) {
      await db.ProductDetail.destroy({
        where: { productId: data.id },
      });
      let productImgs = await db.ProductImage.findAll({
        where: { productDetailId: data.id },
      });
      if (productImgs.length > 0) {
        await db.ProductImage.destroy({
          where: { productDetailId: data.id },
        });
      }
      let product = await db.Product.findOne({
        where: { id: data.id },
      });
      if (product) {
        await db.Product.destroy({
          where: { id: data.id },
        });
      }
      return successResponse("Product detail deleted");
    } else {
      return notValid("No product detail found");
    }
  } catch (error) {
    return errorResponse(error.message);
  }
};

// PRODUCT IMAGE

const uploadFiles = async (files) => {
  const uploadDirectory = "./uploads";

  try {
    await fs.access(uploadDirectory);
  } catch (error) {
    await fs.mkdir(uploadDirectory);
  }

  const fileUploadPromises = files.map(async (file) => {
    const now = new Date();
    const fileName = `${now.getTime()}_${file.originalname}`;
    const filePath = path.join(uploadDirectory, fileName);

    await fs.rename(file.path, filePath);
    return fileName;
  });

  return Promise.all(fileUploadPromises);
};

const saveProductImages = async (productDetailId, imagePaths) => {
  const imageRecords = imagePaths.map((imagePath) => ({
    productDetailId,
    image: imagePath,
  }));

  await db.ProductImage.bulkCreate(imageRecords);
};

const getAllProductImage = async (data) => {
  try {
    if (!data.id || !data.limit || !data.offset) {
      return missingRequiredParams("id, limit, or offset are");
    }
    let productImages = await db.ProductImage.findAll({
      where: { productDetailId: data.id },
      limit: +data.limit,
      offset: +data.offset,
    });
    if (!productImages || productImages.length === 0) {
      return notFound("Product image");
    }

    // Group images by productDetailId
    const groupedImages = productImages.reduce((acc, image) => {
      if (!acc[image.productDetailId]) {
        acc[image.productDetailId] = [];
      }
      acc[image.productDetailId].push(image.image);
      return acc;
    }, {});

    // Convert the grouping result into an array of new objects
    const result = Object.entries(groupedImages).map(
      ([productDetailId, images]) => ({
        productDetailId: +productDetailId,
        image: images,
      })
    );

    return {
      result: result,
      statusCode: 200,
      errors: ["Get all product images successfully"],
    };
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

const getProductImageById = async (id) => {
  try {
    if (!id) {
      return missingRequiredParams("id");
    }
    const productDetailImage = await db.ProductImage.findByPk(id);
    if (!productDetailImage) {
      return notFound("Product image");
    }
    return {
      result: [productDetailImage],
      statusCode: 200,
      errors: [`Get product image with id = ${id} successfully`],
    };
  } catch (error) {
    console.error("Error retrieving product detail image", error);
    return errorResponse(error.message);
  }
};

const updateProductImage = async (id, imagePath) => {
  try {
    const uploadDirectory = "./uploads";

    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory);
    }

    const fileExtension = path.extname(imagePath);
    const fileName = `${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDirectory, fileName);

    fs.renameSync(imagePath, filePath);

    const existingProductImage = await db.ProductImage.findOne({
      where: { id: id },
    });
    console.log(existingProductImage);
    if (
      !existingProductImage ||
      !(existingProductImage instanceof db.ProductImage)
    ) {
      console.error(
        "existingProductImage is not a valid Sequelize Model instance."
      );
      return notFound("Product image");
    }

    // Delete old images before updating
    if (
      existingProductImage.image &&
      fs.existsSync(existingProductImage.image)
    ) {
      fs.unlinkSync(existingProductImage.image);
    }
    existingProductImage.image = filePath;

    await existingProductImage.save();
    return successResponse(`Updated product image with ID = ${id}`);
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

const deleteProductImage = async (id) => {
  try {
    if (!id) {
      return missingRequiredParams("id is");
    }
    const productImage = await db.ProductImage.findByPk(id);
    if (!productImage) {
      return notFound("Product image");
    }
    await productImage.destroy();
    return successResponse(`Deleted product image with id = ${id}`);
  } catch (error) {
    console.error("Error deleting product image", error);
    return errorResponse(error.message);
  }
};

// PRODUCT SIZE
const createProductSize = async (data) => {
  try {
    if (!data.productDetailId || !data.sizeId) {
      return missingRequiredParams("Product detail, size are");
    } else {
      await db.ProductSize.create({
        productDetailId: data.productDetailId,
        sizeId: data.sizeId,
        height: data.height,
        weight: data.weight,
      });
      return successResponse("Product detail size created");
    }
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

const getAllProductSize = async (data) => {
  try {
    const { id, limit, offset } = data;
    if (!id || !limit || !offset) {
      return missingRequiredParams("id, limit, offset are");
    }
    const productSize = await db.ProductSize.findAndCountAll({
      where: { productDetailId: id },
      limit: +limit,
      offset: +offset,
      include: [
        { model: db.AllCode, as: "sizeData", attributes: ["value", "code"] },
      ],
      raw: true,
      nest: true,
    });
    for (let i = 0; i < productSize.rows.length; i++) {
      const receiptDetail = await db.ReceiptDetail.findAll({
        where: { sizeId: productSize.rows[i].id },
      });
      const orderDetail = await db.OrderDetail.findAll({
        where: { productId: productSize.rows[i].id },
      });
      let quantity = 0;
      for (let j = 0; j < receiptDetail.length; j++) {
        quantity += receiptDetail[j].quantity;
      }
      for (let k = 0; k < orderDetail.length; k++) {
        const order = await db.Order.findOne({
          where: { id: orderDetail[k].orderId },
        });
        if (order.statusId != "S7") {
          //S7: hủy đơn
          quantity -= orderDetail[k].quantity;
        }
      }
      productSize.rows[i].stock = quantity;
    }
    return {
      result: [productSize.rows],
      statusCode: 200,
      errors: ["Get all product sizes successfully!"],
    };
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

const getProductSizeById = async (id) => {
  try {
    if (!id) {
      return missingRequiredParams("id");
    } else {
      const productSize = await db.ProductSize.findOne({
        where: { id: id },
      });
      if (!productSize) {
        return notFound("Product size");
      }
      return {
        result: [productSize],
        statusCode: 200,
        errors: [`Get product size with id = ${id} successfully!`],
      };
    }
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

const updateProductSize = async (data) => {
  try {
    if (!data.id || !data.sizeId) {
      return missingRequiredParams("id, size are");
    } else {
      let productSize = await db.ProductSize.findOne({
        where: { id: data.id },
        raw: false,
      });
      if (!productSize) {
        return notFound("Product size");
      }
      productSize.sizeId = data.sizeId;
      productSize.height = data.height;
      productSize.weight = data.weight;
      await productSize.save();
      return successResponse("Product size updated");
    }
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

const deleteProductSize = async (data) => {
  try {
    if (!data.id) {
      return missingRequiredParams("id");
    } else {
      let productSize = await db.ProductSize.findOne({
        where: { id: data.id },
        raw: false,
      });
      if (!productSize) {
        return notFound("product size");
      }
      await productSize.destroy({
        where: { id: data.id },
      });
      return successResponse("Product size deleted");
    }
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

//Get a list of products based on views
const getProductFeature = async (limit) => {
  try {
    if (!limit || isNaN(limit)) {
      return errorResponse("Invalid or missing 'limit' parameter");
    }
    limit = +limit;
    let products = await db.Product.findAll({
      include: [
        { model: db.AllCode, as: "brandData", attributes: ["value", "code"] },
        {
          model: db.AllCode,
          as: "categoryData",
          attributes: ["value", "code"],
        },
        { model: db.AllCode, as: "statusData", attributes: ["value", "code"] },
      ],
      limit: limit,
      order: [["view", "DESC"]],
      raw: true,
      nest: true,
    });
    for (let i = 0; i < products.length; i++) {
      const productDetails = await db.ProductDetail.findAll({
        where: { productId: products[i].id },
        raw: true,
      });
      for (let j = 0; j < productDetails.length; j++) {
        const productSizes = await db.ProductSize.findAll({
          where: { productDetailId: productDetails[j].id },
          raw: true,
        });
        const productImages = await db.ProductImage.findAll({
          where: { productDetailId: productDetails[j].id },
          raw: true,
        });
        productDetails[j].productDetailSize = productSizes;
        productDetails[j].productImage = productImages;
        // Set price to the first product detail's discount price
        products[i].price = productDetails[0].discountPrice;
      }
      products[i].productDetail = productDetails;
    }
    return {
      result: [products],
      statusCode: 200,
      errors: ["Get product feature successfully!"],
    };
  } catch (error) {
    console.log(error);
    return errorResponse(error.message);
  }
};

//Get a list of products based on create time (new products)
const getProductNew = async (limit) => {
  try {
    if (!limit || isNaN(limit)) {
      return errorResponse("Invalid or missing 'limit' parameter");
    }
    limit = +limit;
    let products = await db.Product.findAll({
      include: [
        { model: db.AllCode, as: "brandData", attributes: ["value", "code"] },
        {
          model: db.AllCode,
          as: "categoryData",
          attributes: ["value", "code"],
        },
        { model: db.AllCode, as: "statusData", attributes: ["value", "code"] },
      ],
      limit: limit,
      order: [["createdAt", "DESC"]],
      raw: true,
      nest: true,
    });
    for (let i = 0; i < products.length; i++) {
      const productDetails = await db.ProductDetail.findAll({
        where: { productId: products[i].id },
        raw: true,
      });
      for (let j = 0; j < productDetails.length; j++) {
        const productSizes = await db.ProductSize.findAll({
          where: { productDetailId: productDetails[j].id },
          raw: true,
        });
        const productImages = await db.ProductImage.findAll({
          where: { productDetailId: productDetails[j].id },
          raw: true,
        });

        productDetails[j].productDetailSize = productSizes;
        productDetails[j].productImage = productImages;

        products[i].price = productDetails[0].discountPrice;
      }
      products[i].productDetail = productDetails;
    }
    return {
      result: products,
      statusCode: 200,
      errors: ["Get new product successfully!"],
    };
  } catch (error) {
    console.error(error);
    return errorResponse(error.message);
  }
};

const getProductShopCart = async (data) => {
  try {
    let productArr = [];
    if (!data.userId && !data.limit) {
      return missingRequiredParams("userId or limit");
    } else {
      let shopCart = await db.ShopCart.findAll({
        where: { userId: data.userId },
      });
      for (let i = 0; i < shopCart.length; i++) {
        let productSize = await db.ProductSize.findOne({
          where: { id: shopCart[i].sizeId },
        });
        let productDetail = await db.ProductDetail.findOne({
          where: { id: productSize.productDetailId },
        });
        let product = await db.Product.findOne({
          where: { id: productDetail.productId },
          include: [
            {
              model: db.AllCode,
              as: "brandData",
              attributes: ["value", "code"],
            },
            {
              model: db.AllCode,
              as: "categoryData",
              attributes: ["value", "code"],
            },
            {
              model: db.AllCode,
              as: "statusData",
              attributes: ["value", "code"],
            },
          ],
          limit: +data.limit,
          order: [["view", "DESC"]],
          raw: true,
          nest: true,
        });
        productArr.push(product);
      }
      if (productArr && productArr.length > 0) {
        for (let g = 0; g < productArr.length; g++) {
          let objectFilterProductDetail = {
            where: { productId: productArr[g].id },
            raw: true,
          };
          productArr[g].productDetail = await db.ProductDetail.findAll(
            objectFilterProductDetail
          );
          for (let j = 0; j < productArr[g].productDetail.length; j++) {
            productArr[g].price = productArr[g].productDetail[0].discountPrice;
            productArr[g].productDetail[j].productImage =
              await db.ProductImage.findAll({
                where: { productDetailId: productArr[g].productDetail[j].id },
                raw: true,
              });
          }
        }
      }
    }
    return {
      result: [productArr],
      statusCode: 200,
      errors: ["Get products from shop cart successfully!"],
    };
  } catch (error) {
    console.log(error);
    return errorResponse(error.message);
  }
};

// const getProductRecommend = async (data) => {
//   try {
//     let productArr = [];
//     if (!data.userId && !data.limit) {
//       return missingRequiredParams("userId or limit");
//     } else {
//       let recommender = new jsrecommender.Recommender();
//       let table = new jsrecommender.Table();
//       let rateList = await db.Comment.findAll({
//         where: { star: { [Op.not]: null } },
//       });
//       for (let i = 0; i < rateList.length; i++) {
//         table.setCell(
//           rateList[i].productId,
//           rateList[i].userId,
//           rateList[i].star
//         );
//       }
//       let model = recommender.fit(table);
//       let predicted_table = recommender.transform(table);
//       for (let i = 0; i < predicted_table.columnNames.length; ++i) {
//         let user = predicted_table.columnNames[i];
//         for (let j = 0; j < predicted_table.rowNames.length; ++j) {
//           let product = predicted_table.rowNames[j];
//           if (
//             user == data.userId &&
//             Math.round(predicted_table.getCell(product, user)) > 3
//           ) {
//             let productData = await db.Product.findOne({
//               where: { id: product },
//             });
//             if (productArr.length == +data.limit) {
//               break;
//             } else {
//               productArr.push(productData);
//             }
//           }
//         }
//       }
//       if (productArr && productArr.length > 0) {
//         for (let g = 0; g < productArr.length; g++) {
//           let objectFilterProductDetail = {
//             where: { productId: productArr[g].id },
//             raw: true,
//           };
//           productArr[g].productDetail = await db.ProductDetail.findAll(
//             objectFilterProductDetail
//           );
//           for (let j = 0; j < productArr[g].productDetail.length; j++) {
//             productArr[g].price = productArr[g].productDetail[0].discountPrice;
//             productArr[g].productDetail[j].productImage =
//               await db.ProductImage.findAll({
//                 where: { productDetailId: productArr[g].productDetail[j].id },
//                 raw: true,
//               });
//           }
//         }
//       }
//     }
//     return {
//       result: [productArr],
//       statusCode: 200,
//       errors: ["Get recommended products successfully!"],
//     };
//   } catch (error) {
//     console.log(error);
//     return errorResponse(error.message);
//   }
// };

export default {
  createProduct,
  getAllProductAdmin,
  getAllProductUser,
  inActiveProduct,
  activeProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductDetail,
  getProductDetailById,
  updateProductDetail,
  deleteProductDetail,
  uploadFiles,
  saveProductImages,
  getAllProductImage,
  getProductImageById,
  updateProductImage,
  deleteProductImage,
  createProductSize,
  getAllProductSize,
  getProductSizeById,
  updateProductSize,
  deleteProductSize,
  getProductFeature,
  getProductNew,
  getProductShopCart,
  // getProductRecommend,
};
