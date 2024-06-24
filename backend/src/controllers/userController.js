import userService from "../services/userService";
const { errorResponse, successResponse } = require("../utils/ResponseUtils");

const handleRequest = async (handler, req, res) => {
  try {
    const data = await handler(req.body);
    const statusCode = data.statusCode || 500;
    console.log(data);
    return res.status(statusCode).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse(error.message));
  }
};

const registerUser = async (req, res) => {
  return handleRequest(userService.registerUser, req, res);
};

const loginUser = async (req, res) => {
  return handleRequest(userService.loginUser, req, res);
};

const updateUser = async (req, res) => {
  return handleRequest(userService.updateUser, req, res);
};

const deleteUser = async (req, res) => {
  return handleRequest(userService.deleteUser, req, res);
};

const changePassword = async (req, res) => {
  return handleRequest(userService.changePassword, req, res);
};

const getAllUser = async (req, res) => {
  return handleRequest(userService.getAllUser, req, res);
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.query;
    const data = await userService.getUserById(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getUserById:", error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

const checkUserPhoneNumber = async (req, res) => {
  return handleRequest(userService.checkPhoneNumber, req, res);
};

export default {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getUserById,
  checkUserPhoneNumber,
  changePassword,
};
