'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class quirurgico_movimientos extends Model {
    static associate(models) {
      quirurgico_movimientos.belongsTo(models.quirurgicos, {
        foreignKey: "id_quirurgico",
      });
    }
  };
  quirurgico_movimientos.init({
    cantidad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    existencia_previa: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_costo: {
      type: DataTypes.STRING,
    },
    precio_venta: {
      type: DataTypes.STRING,
    },
    movimiento: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_quirurgico: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'quirurgico_movimientos',
  });
  return quirurgico_movimientos;
};