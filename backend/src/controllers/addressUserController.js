import addressUserService from "../services/addressUserService";
import { errorResponse } from "../utils/ResponseUtils";

const handleAddressUserRequest = async (serviceFunc, req, res) => {
  try {
    const data = await serviceFunc(req.body, req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

const createAddressUser = async (req, res) => {
  return handleAddressUserRequest(
    addressUserService.createAddressUser,
    req,
    res
  );
};

const getAllAddressUser = async (req, res) => {
  try {
    const data = await addressUserService.getAllAddressUser(req.query.userId);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

// const deleteAddressUser = async (req, res) => {
//   return handleAddressUserRequest(
//     addressUserService.deleteAddressUser,
//     req,
//     res
//   );
// };

const deleteAddressUser = async (req, res) => {
  try {
    const data = await addressUserService.deleteAddressUser(req.query.id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

const editAddressUser = async (req, res) => {
  return handleAddressUserRequest(addressUserService.editAddressUser, req, res);
};

const getAddressUserById = async (req, res) => {
  try {
    const data = await addressUserService.getAddressUserById(req.query.id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorResponse("Error from server"));
  }
};

module.exports = {
  createAddressUser,
  getAllAddressUser,
  deleteAddressUser,
  editAddressUser,
  getAddressUserById,
};
