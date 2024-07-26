'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class examenes extends Model {
    static associate(models) {

    }
  };
  examenes.init({
    id_expediente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comision: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    whatsapp: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    numero_muestra: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    referido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_encargado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    porPagar: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pagado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'examenes',
  });
  return examenes;
};