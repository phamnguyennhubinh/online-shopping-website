"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Receipt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Receipt.belongsTo(models.Supplier, {
        as: "supplierData",
        foreignKey: "supplierId",
      });
      Receipt.hasMany(models.ReceiptDetail, {
        as: "receiptDetails",
        foreignKey: "receiptId",
      });
    }
  }
  Receipt.init(
    {
      userId: DataTypes.INTEGER,
      supplierId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Receipt",
      tableName: "receipts",
    }
  );
  return Receipt;
};
