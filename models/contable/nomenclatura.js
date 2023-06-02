'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class nomenclatura extends Model {
    static associate(models) {
      nomenclatura.hasMany(models.detalle_partidas, {
        foreignKey: "id_rubro",
      });
    }
  };
  nomenclatura.init({
    nombre: {
      type: DataTypes.STRING,
    },
    codigo: {
      type: DataTypes.STRING,
    },
    clasificacion: {
      type: DataTypes.STRING,
    },
    tipo: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'nomenclaturas',
  });
  return nomenclatura;
};