"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrderDetail.belongsTo(models.Order, {
        foreignKey: "orderId",
        targetKey: "id",
        as: "orderData",
      });
    }
  }
  OrderDetail.init(
    {
      orderId: DataTypes.INTEGER,
      sizeId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      realPrice: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "OrderDetail",
      tableName: "order_details",
    }
  );
  return OrderDetail;
};
