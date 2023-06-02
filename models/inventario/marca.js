'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class marca extends Model {
    static associate(models) {
      marca.belongsTo(models.casa_medicas, {
        foreignKey: "id_casa_medica",
      });
      marca.hasMany(models.medicamentos, {
        foreignKey: "id_marca",
      });
      marca.hasMany(models.medicamento_externos, {
        foreignKey: "id_marca",
      });
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
    id_casa_medica: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'marcas',
  });
  return marca;
};