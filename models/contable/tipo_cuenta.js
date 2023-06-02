'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tipo_cuenta extends Model {
    static associate(models) {
      tipo_cuenta.hasMany(models.cuenta_bancarias, {
        foreignKey: "id_tipo_cuenta",
      });
    }
  };
  tipo_cuenta.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'tipo_cuentas',
  });
  return tipo_cuenta;
};