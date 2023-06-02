'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tipo_equipo extends Model {
    static associate(models) {
      tipo_equipo.hasMany(models.equipo_galo_techs, {
        foreignKey: "id_tipo_equipo",
      });
    }
  };
  tipo_equipo.init({
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
    modelName: 'tipo_equipos',
  });
  return tipo_equipo;
};