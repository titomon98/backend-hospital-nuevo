'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class rubro extends Model {
    static associate(models) {
      rubro.hasMany(models.caja_chicas, {
        foreignKey: "id_rubro",
      });
    }
  };
  rubro.init({
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
    modelName: 'rubros',
  });
  return rubro;
};