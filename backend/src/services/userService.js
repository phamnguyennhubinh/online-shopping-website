import db from "../models";
import bcrypt from "bcryptjs";
import CommonUtils from "../utils/CommonUtils";
import {
  successResponse,
  errorResponse,
  missingRequiredParams,
  notFound,
} from "../utils/ResponseUtils";

require("dotenv").config();

const hashUserPassword = async (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

const checkUserPhoneNumber = async (userPhoneNumber) => {
  const user = await db.User.findOne({
    where: { phoneNumber: userPhoneNumber },
  });
  return !!user;
};

const registerUser = async (data) => {
  try {
    if (!data.phoneNumber) {
      return missingRequiredParams("phoneNumber");
    }

    const isExist = await checkUserPhoneNumber(data.phoneNumber);
    if (isExist) {
      return errorResponse(`User already exists`);
    }

    const hashPassword = await hashUserPassword(data.password);
    await db.User.create({
      email: data.email,
      password: hashPassword,
      fullName: data.fullName,
      address: data.address,
      roleId: data.roleId,
      phoneNumber: data.phoneNumber,
      image: data.avatar,
      dob: data.dob,
      isActivePhone: 0,
      statusId: "S1",
      userToken: "",
    });

    return successResponse("User registration");
  } catch (error) {
    console.log(error);
    return errorResponse();
  }
};

const loginUser = async (data) => {
  try {
    if (!data.phoneNumber || !data.password) {
      return missingRequiredParams("phoneNumber or password");
    }
    const isExist = await checkUserPhoneNumber(data.phoneNumber);
    if (!isExist) {
      return notFound("Phone number");
    }
    const user = await db.User.findOne({
      attributes: ["email", "roleId", "password", "fullName", "id"],
      where: { phoneNumber: data.phoneNumber, statusId: "S1" },
    });

    if (!user) {
      return notFound("User");
    }
    let check = await bcrypt.compare(data.password, user.password);
    if (!check) {
      return {
        result: [],
        statusCode: 401,
        errors: ["Wrong password!"],
      };
    }
    // Delete password before return information of user
    delete user.password;
    const accessToken = CommonUtils.encodeToken(user.id);
    return {
      result: [{ accessToken: accessToken, userId: user.id }],
      statusCode: 200,
      errors: ["Login successful"],
    };
  } catch (error) {
    console.error("Error in login:", error);
    return errorResponse();
  }
};

const deleteUser = async (userId) => {
  try {
    if (!userId) {
      return missingRequiredParams("userId");
    }
    const foundUser = await db.User.findOne({ where: { id: userId } });
    if (!foundUser) {
      return userNotExist();
    }

    await db.User.destroy({ where: { id: userId } });

    return successResponse("Deleted user");
  } catch (error) {
    console.log(error);
    return errorResponse(error.message);
  }
};

const updateUser = async (data) => {
  try {
    console.log("Received data:", data); // Log received data for debugging

    // Validate presence of 'id' in data
    if (!data.id) {
      return {
        statusCode: 400,
        errors: ["id is required!"],
      };
    }

    const updateFields = {};
    if (data.email) {
      updateFields.email = data.email;
    }
    if (data.fullName) {
      updateFields.fullName = data.fullName;
    }
    if (data.address) {
      updateFields.address = data.address;
    }
    if (data.phoneNumber) {
      updateFields.phoneNumber = data.phoneNumber;
    }
    if (data.image) {
      updateFields.image = data.image; // Assuming 'image' is correct property name
    }
    if (data.dob) {
      updateFields.dob = data.dob;
    }

    // Update user in the database
    const [updatedRowsCount] = await db.User.update(updateFields, {
      where: { id: data.id },
    });

    if (updatedRowsCount === 0) {
      return {
        statusCode: 404,
        errors: ["User not found"],
      };
    }

    // Fetch updated user record from the database
    const updatedUser = await db.User.findByPk(data.id);

    // Return success response
    return {
      result: [updatedUser],
      statusCode: 200,
      message: "User updated successfully",
    };
  } catch (error) {
    console.error("Error in updateUser:", error);
    return {
      statusCode: 500,
      errors: ["Failed to update User"],
    };
  }
};

const getAllUser = async (data) => {
  try {
    let objectFilter = {
      where: { statusId: "S1" },
      attributes: {
        exclude: ["password", "image"],
      },
      include: [
        { model: db.AllCode, as: "roleData", attributes: ["value", "code"] },
      ],
      raw: true,
      nest: true,
    };

    if (data.limit && data.offset) {
      objectFilter.limit = +data.limit;
      objectFilter.offset = +data.offset;
    }
    const users = await db.User.findAll(objectFilter);
    return {
      result: users,
      statusCode: 200,
      errors: "Get all users successfully!",
    };
  } catch (error) {
    console.log(error);
    return errorResponse(error.message);
  }
};

const getUserById = async (id) => {
  try {
    if (!id) {
      return missingRequiredParams("id");
    }

    const user = await db.User.findOne({
      where: { id, statusId: "S1" },
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
      include: [
        { model: db.AllCode, as: "roleData", attributes: ["value", "code"] },
        { model: db.AllCode, as: "statusData", attributes: ["value", "code"] },
      ],
      raw: true,
      nest: true,
    });

    if (!user) {
      return userNotExist();
    }

    let userData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      status: user.statusData.value,
      role: user.roleData
        ? { code: user.roleData.code, value: user.roleData.value }
        : null,
      image: user.image
        ? Buffer.from(user.image, "base64").toString("binary")
        : null,
    };

    return {
      result: userData,
      statusCode: 200,
      message: "Get user by id successfully!",
    };
  } catch (error) {
    console.error("Error in getUserById:", error);
    return errorResponse("An error occurred while fetching the user");
  }
};

const changePassword = async (data) => {
  try {
    if (!data.id || !data.password || !data.oldpassword) {
      return missingRequiredParams("id, password, or oldpassword");
    }

    let user = await db.User.findOne({
      where: { id: data.id },
      raw: false,
    });

    if (!user) {
      return userNotExist();
    }

    const isMatch = await bcrypt.compare(data.oldpassword, user.password);
    if (!isMatch) {
      return {
        statusCode: 2,
        errors: "Old password is wrong!",
      };
    }

    user.password = await hashUserPassword(data.password);
    await user.save();

    return successResponse("Change password");
  } catch (error) {
    console.error("Error in changePassword:", error);
    return errorResponse();
  }
};

export default {
  registerUser,
  loginUser,
  deleteUser,
  updateUser,
  getAllUser,
  getUserById,
  checkUserPhoneNumber,
  changePassword,
};
