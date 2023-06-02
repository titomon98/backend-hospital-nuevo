'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class inventario extends Model {
    static associate(models) {
      inventario.belongsTo(models.medicamentos, {
        foreignKey: "id_medicamento",
      });
      inventario.hasMany(models.detalle_ventas, {
        foreignKey: "id_inventario",
      });
      inventario.hasMany(models.detalle_compras, {
        foreignKey: "id_inventario",
      });
    }
  };
  inventario.init({
    existencia: {
      type: DataTypes.STRING,
      allowNull: false
    },
    existencia_minima: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_costo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_publico: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_medicamento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'inventarios',
  });
  return inventario;
};