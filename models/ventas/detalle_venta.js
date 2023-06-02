'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_venta extends Model {
    static associate(models) {
      detalle_venta.belongsTo(models.inventarios, {
        foreignKey: "id_inventario",
      });
      detalle_venta.belongsTo(models.ventas, {
        foreignKey: "id_venta",
      });
    }
  };
  detalle_venta.init({
    cantidad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pertenencia: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_inventario: {
      type: DataTypes.INTEGER,
    },
    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'detalle_ventas',
  });
  return detalle_venta;
};