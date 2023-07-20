'use strict';
var DataTypes = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class muestras_movimientos extends Model {
    static associate(models) {
      muestras_movimientos.belongsTo(models.muestras_medicas, {
        foreignKey: "id_muestra",
      });
    }
  };
  muestras_movimientos.init({
    cantidad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    existencia_previa: {
      type: DataTypes.STRING,
      allowNull: false
    },
    existencia_nueva: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
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
    id_muestra: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: '',
  });
  return muestras_movimientos;
};