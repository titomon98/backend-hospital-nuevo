'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class contribuyente extends Model {
    static associate(models) {
      contribuyente.hasMany(models.compras, {
        foreignKey: "id_contribuyente",
      });
    }
  };
  contribuyente.init({
    iva: {
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
    modelName: 'contribuyentes',
  });
  return contribuyente;
};