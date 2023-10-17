'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class habitaciones extends Model {
    static associate(models) {
      /* habitaciones.hasMany(models.cuenta_bancarias, {
        foreignKey: "id_habitaciones",
      }); */
    }
  };
  habitaciones.init({
    numero: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    costo_ambulatorio: {
        type: DataTypes.STRING,
        allowNull: false
    },
    costo_diario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'habitaciones',
  });
  return habitaciones;
};