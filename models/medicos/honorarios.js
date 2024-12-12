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
    modelName: 'banco',
  });
  return banco;
};