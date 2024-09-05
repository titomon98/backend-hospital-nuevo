'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class factura extends Model {
    static associate(models) { 
    }
  };
  factura.init({
    numero: {
      type: DataTypes.STRING,
      allowNull: false
    },
    total: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_cuenta_hospital: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_cuenta_laboratorio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    imagen: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'facturacion',
  });
  return factura;
};