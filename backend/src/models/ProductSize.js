"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductSize extends Model {
    static associate(models) {
      ProductSize.belongsTo(models.AllCode, {
        foreignKey: "sizeId",
        targetKey: "code",
        as: "sizeData",
      });
    }
  }
  ProductSize.init(
    {
      productDetailId: DataTypes.INTEGER,
      height: DataTypes.STRING,
      weight: DataTypes.STRING,
      sizeId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ProductSize",
      tableName: "product_sizes",
    }
  );
  return ProductSize;
};
