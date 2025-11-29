'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class personal extends Model {
    static associate(models) {
      personal.hasMany(models.detalle_personals, {
          foreignKey: "id_personal",
      });
    }
  };
  personal.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
      telefono: {
        type: DataTypes.STRING,
        allowNull: false
      },
      correo: {
        type: DataTypes.STRING,
      },
      observaciones: {
        type: DataTypes.TEXT,
      },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false
    }
  }, {
    sequelize,
    modelName: 'personals',
  });
  return personal;
};