"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.TypeShip, {
        foreignKey: "typeShipId",
        targetKey: "id",
        as: "typeShipData",
      });
      Order.hasMany(models.OrderDetail, {
        foreignKey: "orderId",
        as: "orderDetailData",
      });
      Order.belongsTo(models.AllCode, {
        foreignKey: "statusId",
        targetKey: "code",
        as: "statusOrderData",
      });
    }
  }
  Order.init(
    {
      addressUserId: DataTypes.INTEGER,
      statusId: DataTypes.STRING,
      typeShipId: DataTypes.INTEGER,
      voucherId: DataTypes.INTEGER,
      note: DataTypes.STRING,
      isPaymentOnline: DataTypes.INTEGER,
      shipperId: DataTypes.INTEGER,
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
    }
  );
  return Order;
};
