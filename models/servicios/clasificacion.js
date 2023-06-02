'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class clasificacion extends Model {
    static associate(models) {
      clasificacion.hasMany(models.zapatos, {
        foreignKey: "id_clasificacion",
      })
    }
  };
  clasificacion.init({
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
    modelName: 'clasificaciones',
  });
  return clasificacion;
};