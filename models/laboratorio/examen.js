'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class examen extends Model {
    static associate(models) {
      examen.belongsTo(models.tipo_examenes, {
        foreignKey: "id_tipo_examen",
      });
      examen.hasMany(models.detalle_examenes, {
        foreignKey: "id_examen",
      });
      examen.hasMany(models.equipos, {
        foreignKey: "id_examen",
      });
      examen.hasMany(models.campo_examenes, {
        foreignKey: "id_examen",
      });
      examen.hasMany(models.consulta_laboratorios, {
        foreignKey: "id_examen",
      });
    }
  };
  examen.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tipo_examen: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'examenes',
  });
  return examen;
};