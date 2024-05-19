import db from "../models/index";
import { errorResponse, successResponse } from "../utils/ResponseUtils";

const createAddressUser = async (data) => {
  try {
    if (!data.userId) {
      return errorResponse("Missing required parameter!");
    }

    await db.AddressUser.create({
      userId: data.userId,
      shipName: data.shipName,
      shipAddress: data.shipAddress,
      shipEmail: data.shipEmail,
      shipPhoneNumber: data.shipPhoneNumber,
    });

    return successResponse("Create address user");
  } catch (error) {
    console.error(error);
    return errorResponse("Error from server");
  }
};

const getAllAddressUser = async (userId) => {
  try {
    if (!userId) {
      return errorResponse("Missing required parameter!");
    }

    const addresses = await db.AddressUser.findAll({
      where: { userId: userId },
    });

    return {
      result: addresses,
      statusCode: 200,
      errors: ["Retrieved all address user successfully!"],
    };
  } catch (error) {
    console.error(error);
    return errorResponse("Error from server");
  }
};

const deleteAddressUser = async (data) => {
  try {
    const { id } = data;
    if (!id) {
      return missingRequiredParams("id");
    }

    const addressUser = await db.AddressUser.findOne({ where: { id } });
    if (!addressUser) {
      return notFound("Address user not found");
    }

    await db.AddressUser.destroy({ where: { id } });

    return successResponse(`Address user id = ${id} deleted`);
  } catch (error) {
    console.error("Error in deleteAddressUser:", error);
    return errorResponse("Failed to delete address user");
  }
};

const editAddressUser = async (data) => {
  try {
    const { id, shipName, shipAddress, shipEmail, shipPhoneNumber } = data;
    if (!id || !shipName || !shipAddress || !shipEmail || !shipPhoneNumber) {
      return missingRequiredParams(
        "id, shipName, shipAddress, shipEmail, shipPhoneNumber"
      );
    }

    const [updatedRowsCount] = await db.AddressUser.update(
      {
        shipName,
        shipAddress,
        shipEmail,
        shipPhoneNumber,
      },
      {
        where: { id },
      }
    );

    if (updatedRowsCount === 0) {
      return notFound("Address user not found");
    }

    const updatedAddressUser = await db.AddressUser.findByPk(id);
    return {
      result: [updatedAddressUser],
      statusCode: 200,
      errors: ["Address user updated successfully!"],
    };
  } catch (error) {
    console.error(error);
    return errorResponse("Error from server");
  }
};

const getAddressUserById = async (id) => {
  try {
    if (!id) {
      return errorResponse("Missing required parameter!");
    }

    const addressUser = await db.AddressUser.findByPk(id);
    if (!addressUser) {
      return errorResponse("Address user not found");
    }

    return {
      result: [addressUser],
      statusCode: 200,
      errors: [`Retrieved address user ${id} successfully!`],
    };
  } catch (error) {
    console.error(error);
    return errorResponse("Error from server");
  }
};

module.exports = {
  createAddressUser,
  getAllAddressUser,
  deleteAddressUser,
  editAddressUser,
  getAddressUserById,
};
