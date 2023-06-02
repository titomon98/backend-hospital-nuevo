'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class clinica extends Model {
    static associate(models) {
      clinica.belongsTo(models.centros, {
        foreignKey: "id_centro",
      });
      clinica.hasMany(models.arrendamientos, {
        foreignKey: "id_clinica",
      });
    }
  };
  clinica.init({
    numero: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_centro: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'clinicas',
  });
  return clinica;
};