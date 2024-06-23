"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.AllCode, {
        foreignKey: "roleId",
        targetKey: "code",
        as: "roleData",
      });
      User.belongsTo(models.AllCode, {
        foreignKey: "statusId",
        targetKey: "code",
        as: "statusData",
      });
    }
  }

  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isStrongPassword(value) {
            if (
              !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(
                value
              )
            ) {
              throw new Error(
                "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character"
              );
            }
          },
        },
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      address: DataTypes.STRING,
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isPhoneNumber(value) {
            if (!/^(0[2-9][0-9]{8}|[2-9][0-9]{8})$/.test(value)) {
              throw new Error("Invalid phone number format");
            }
          },
        },
      },
      image: DataTypes.BLOB("long"),
      dob: {
        type: DataTypes.STRING,
        validate: {
          isDate: true,
        },
      },
      isActivePhone: DataTypes.BOOLEAN,
      roleId: DataTypes.STRING,
      statusId: DataTypes.STRING,
      userToken: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    }
  );

  return User;
};
