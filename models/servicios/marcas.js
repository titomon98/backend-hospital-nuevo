'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class marca extends Model {
    static associate(models) {
      marca.hasMany(models.zapatos, {
        foreignKey: "id_marca",
      })
    }
  };
  marca.init({
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
    modelName: 'marcas',
  });
  return marca;
};