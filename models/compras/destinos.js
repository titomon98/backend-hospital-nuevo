'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class destino extends Model {
    static associate(models) {
      destino.hasMany(models.compras, {
        foreignKey: "id_destino",
      });
    }
  };
  destino.init({
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
    modelName: 'destinos',
  });
  return destino;
};