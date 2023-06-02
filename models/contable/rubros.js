'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class rubro extends Model {
    static associate(models) {
      rubro.hasMany(models.detalle_partidas, {
        foreignKey: "id_rubro",
      });
    }
  };
  rubro.init({
    codigo: {
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
    modelName: 'rubros',
  });
  return rubro;
};