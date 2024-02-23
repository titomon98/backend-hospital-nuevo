'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class receta extends Model {
    static associate(models) {
      receta.belongsTo(models.expedientes, {
        foreignKey: "id_expediente",
      });
      receta.belongsTo(models.medicos, {
        foreignKey: "id_medico",
      });
    }
  };
  receta.init({
    contenido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_expediente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_medico: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'recetas',
  });
  return receta;
};