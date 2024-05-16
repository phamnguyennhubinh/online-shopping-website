import productService from "../services/productService";
import {
  errorResponse,
  successResponse,
  missingRequiredParams,
} from "../utils/ResponseUtils";

const handleRequest = async (handler, req, res) => {
  try {
    const data = await handler(req.body);
    if (!data) {
      return res
        .status(500)
        .json(errorResponse("Failed to process the request"));
    }
    const statusCode = data.statusCode || 200;
    return res.status(statusCode).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Internal server error"));
  }
};

// PRODUCT
const createProduct = async (req, res) => {
  try {
    const productData = {
      name: req.body.name,
      content: req.body.content,
      categoryId: req.body.categoryId,
      brandId: req.body.brandId,
      color: req.body.color,
      originalPrice: req.body.originalPrice,
      discountPrice: req.body.discountPrice,
      height: req.body.height,
      weight: req.body.weight,
      sizeId: req.body.sizeId,
    };

    let images = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map((file) => file.path);
    }

    const result = await createProduct(productData, images);
    return {
      result: [result],
      statusCode: 200,
      errors: ["Success!"],
    };
  } catch (error) {
    return errorResponse(error.message);
  }
};

const getAllProductAdmin = async (req, res) => {
  try {
    const data = await productService.getAllProductAdmin(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error retrieving products:", error);
    return res.status(500).json(errorResponse("Internal server error"));
  }
};

const getAllProductUser = async (req, res) => {
  try {
    const data = await productService.getAllProductUser(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error retrieving products:", error);
    return res.status(500).json(errorResponse("Internal server error"));
  }
};

const getProductById = async (req, res) => {
  try {
    const data = await productService.getProductById(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

const inActiveProduct = async (req, res) => {
  try {
    const data = await productService.inActiveProduct(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

const activeProduct = async (req, res) => {
  try {
    const data = await productService.activeProduct(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

const updateProduct = async (req, res) => {
  await handleRequest(productService.updateProduct, req, res);
};

// PRODUCT DETAIL
const createProductDetail = async (req, res) => {
  await handleRequest(productService.createProductDetail, req, res);
};

const getProductDetailById = async (req, res) => {
  try {
    const data = await productService.getProductDetailById(req.query.id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

const updateProductDetail = async (req, res) => {
  await handleRequest(productService.updateProductDetail, req, res);
};

const deleteProductDetail = async (req, res) => {
  try {
    const data = await productService.deleteProductDetail(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

// PRODUCT IMAGE

const uploadProductImages = async (req, res) => {
  try {
    console.log("Request received:", req.body, req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json(missingRequiredParams("Files"));
    }
    const { productDetailId } = req.body;
    const files = req.files;

    const imagePaths = await productService.uploadFiles(files);

    await productService.saveProductImages(productDetailId, imagePaths);

    console.log("Product images uploaded successfully");
    return res
      .status(200)
      .json(successResponse("Uploaded and created new product images"));
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse());
  }
};

const getAllProductImage = async (req, res) => {
  try {
    const { id, limit, offset } = req.query;
    if (!id || !limit || !offset) {
      return res
        .status(400)
        .json(missingRequiredParams("id, limit, or offset"));
    }
    const data = { id, limit, offset };
    const result = await productService.getAllProductImage(data);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getting product images:", error);
    return res
      .status(500)
      .json(errorResponse("Failed to retrieve product images"));
  }
};

const getProductImageById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res
        .status(400)
        .json(errorResponse("Missing required parameter: id"));
    }
    const data = await productService.getProductImageById(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(errorResponse("Failed to retrieve product image"));
  }
};

const updateProductImage = async (req, res) => {
  try {
    const id = req.body.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json(missingRequiredParams("File"));
    }
    const imagePath = file.path;
    await productService.updateProductImage(id, imagePath);

    return res.status(200).json(successResponse("Updated product image"));
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse());
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res
        .status(400)
        .json(errorResponse("Missing required parameter: id"));
    }
    const data = await productService.deleteProductImage(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(errorResponse("Failed to delete product image"));
  }
};

// PRODUCT SIZE
const createProductSize = async (req, res) => {
  await handleRequest(productService.createProductSize, req, res);
};

const getAllProductSize = async (req, res) => {
  try {
    const data = await productService.getAllProductSize(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error retrieving products:", error);
    return res.status(500).json(errorResponse("Internal server error"));
  }
};

const getProductSizeById = async (req, res) => {
  try {
    const data = await productService.getProductSizeById(req.query.id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

const updateProductSize = async (req, res) => {
  await handleRequest(productService.updateProductSize, req, res);
};

const deleteProductSize = async (req, res) => {
  try {
    const data = await productService.deleteProductSize(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};
// Additional Product Functions
const getProductFeature = async (req, res) => {
  try {
    const data = await productService.getProductFeature(req.query.limit);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

const getProductNew = async (req, res) => {
  try {
    const data = await productService.getProductNew(req.query.limit);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

const getProductShopCart = async (req, res) => {
  try {
    const data = await productService.getProductShopCart(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

const getProductRecommend = async (req, res) => {
  try {
    const data = await productService.getProductRecommend(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

export default {
  createProduct,
  getAllProductAdmin,
  getAllProductUser,
  getProductById,
  inActiveProduct,
  activeProduct,
  updateProduct,
  createProductDetail,
  getProductDetailById,
  updateProductDetail,
  deleteProductDetail,
  uploadProductImages,
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
  getProductRecommend,
};
