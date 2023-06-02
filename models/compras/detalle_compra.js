'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_compra extends Model {
    static associate(models) {
      detalle_compra.belongsTo(models.medicamentos, {
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
    id_compra: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'detalle_compras',
  });
  return detalle_compra;
};