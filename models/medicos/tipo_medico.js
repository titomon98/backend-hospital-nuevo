'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tipo_medico extends Model {
    static associate(models) {
      tipo_medico.hasMany(models.medicos, {
        foreignKey: "id_tipo_medico",
      });
    }
  };
  tipo_medico.init({
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
    modelName: 'tipo_medicos',
  });
  return tipo_medico;
};