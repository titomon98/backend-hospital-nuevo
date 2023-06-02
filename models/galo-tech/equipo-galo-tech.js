'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class equipo extends Model {
    static associate(models) {
      equipo.belongsTo(models.tipo_equipos, {
        foreignKey: "id_tipo_equipo",
      });
      equipo.hasMany(models.inventario_galo_techs, {
        foreignKey: "id_equipo",
      });
    }
  };
  equipo.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    existencia_total: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tipo_equipo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'equipo_galo_techs',
  });
  return equipo;
};