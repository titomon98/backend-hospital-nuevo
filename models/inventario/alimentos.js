'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class alimentos extends Model {
    static associate(models) {
      alimentos.hasMany(models.alimentos_movimientos, {
        foreignKey: "id_alimento",
      });
    }
  };
  alimentos.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_costo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_venta: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'alimentos',
  });
  return alimentos;
};