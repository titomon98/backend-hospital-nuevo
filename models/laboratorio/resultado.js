'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class banco extends Model {
    static associate(models) {
      /* banco.hasMany(models.cuenta_bancarias, {
        foreignKey: "id_banco",
      }); */
    }
  };
  banco.init({
    contrato: {
      type: DataTypes.STRING,
      allowNull: false
    },
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
    modelName: 'contratos',
  });
  return banco;
};