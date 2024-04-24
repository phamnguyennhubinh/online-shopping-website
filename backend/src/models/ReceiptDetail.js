"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ReceiptDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  ReceiptDetail.init(
    {
      receiptId: DataTypes.INTEGER,
      productSizeId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      price: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "ReceiptDetail",
      tableName: "receipt_details",
    }
  );
  return ReceiptDetail;
};
