'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_compra extends Model {
    static associate(models) {
      detalle_compra.belongsTo(models.inventario_insumos_laboratorios, {
        foreignKey: "id_inventario",
      });
      detalle_compra.belongsTo(models.compras, {
        foreignKey: "id_compra",
      });
    }
  };
  detalle_compra.init({
    cantidad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_inventario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_compra: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'detalle_compras_laboratorios',
  });
  return detalle_compra;
};