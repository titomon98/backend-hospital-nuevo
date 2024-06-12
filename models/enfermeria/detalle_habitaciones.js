'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_habitaciones extends Model {
    static associate(models) {
      /* banco.hasMany(models.cuenta_bancarias, {
        foreignKey: "id_banco",
      }); */
    }
  };
  detalle_habitaciones.init({}, {
    sequelize,
    modelName: 'detalle_habitaciones',
  });
  return detalle_habitaciones;
};