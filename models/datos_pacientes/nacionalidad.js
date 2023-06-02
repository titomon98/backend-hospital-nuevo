'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class nacionalidad extends Model {
    static associate(models) {
      nacionalidad.hasMany(models.pacientes, {
        foreignKey: "id_nacionalidad",
        as: 'nacionalidades'
      });
    }
  };
  nacionalidad.init({
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
    modelName: 'nacionalidades',
  });
  return nacionalidad;
};