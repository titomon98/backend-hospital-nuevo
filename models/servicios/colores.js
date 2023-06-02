'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class color extends Model {
    static associate(models) {
      color.hasMany(models.zapatos, {
        foreignKey: "id_color",
      })
    }
  };
  color.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    codigo: {
        type: DataTypes.STRING,
      },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'colores',
  });
  return color;
};