'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class equipos extends Model {
    static associate(models) {
      /* equipos.hasMany(models.equipos_movimientos, {
        foreignKey: "id_equipo",
      }); */
    }
  };
  equipos.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cantidad_usos: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_publico: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gasto_unico: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fecha_adquisicion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    existencia: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'equipos',
  });
  return equipos;
};