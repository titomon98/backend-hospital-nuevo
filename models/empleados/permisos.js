'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class permiso extends Model {
    static associate(models) {
      permiso.hasMany(models.detalle_permisos, {
        foreignKey: "id_permiso",
      });
    }
  };
  permiso.init({
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
    modelName: 'permisos',
  });
  return permiso;
};