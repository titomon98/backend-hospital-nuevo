'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tipo_insumo_laboratorios extends Model {
    static associate(models) {
      tipo_insumo_laboratorios.hasMany(models.insumos_laboratorios, {
        foreignKey: "id_tipo_insumo_laboratorios",
      });
    }
  };
  tipo_insumo_laboratorios.init({
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
    modelName: 'tipo_insumo_laboratorios',
  });
  return tipo_insumo_laboratorios;
};