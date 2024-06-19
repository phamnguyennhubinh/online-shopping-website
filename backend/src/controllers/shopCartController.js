import shopCartService from "../services/shopCartService";
import { successResponse, errorResponse } from "../utils/ResponseUtils";

const addShopCart = async (req, res) => {
  try {
    const data = await shopCartService.addShopCart(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in addShopCart:", error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

const updateShopCart = async (req, res) => {
  try {
    const data = await shopCartService.updateShopCart(req.body, req.orderDetails || {});
    return res.status(data.statusCode || 200).json(data);
  } catch (error) {
    console.error("Error in updateShopCart:", error);
    return res.status(500).json(errorResponse("Error from server", 500));
  }
}

const getShopCartByUserId = async (req, res) => {
  try {
    const data = await shopCartService.getShopCartByUserId(req.query.userId);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getShopCartByUserId:", error);
    return res.status(200).json(errorResponse("Error from server"));
  }
};

const deleteItem = async (req, res) => {
  try {
    const data = { id: req.query.id };
    const result = await shopCartService.deleteItem(data);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteItem:", error);
    return res.status(200).json(errorResponse("Error from server"));
  }
};

export default { addShopCart, updateShopCart, getShopCartByUserId, deleteItem };
