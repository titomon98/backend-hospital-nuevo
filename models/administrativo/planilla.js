'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class planilla extends Model {
    static associate(models) {
      planilla.hasMany(models.detalle_planillas, {
        foreignKey: "id_planilla",
      });
    }
  };
  planilla.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    num_cuenta: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bono: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    igss: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isr: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prestamo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    liquido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'planillas',
  });
  return planilla;
};