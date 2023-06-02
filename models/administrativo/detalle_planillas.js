'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_planilla extends Model {
    static associate(models) {
      detalle_planilla.belongsTo(models.planillas, {
        foreignKey: "id_planilla",
      });
    }
  };
  detalle_planilla.init({
    fecha: {
        type: DataTypes.STRING,
      },
    descripcion: {
      type: DataTypes.STRING,
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
    id_planilla: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'detalle_planillas',
  });
  return detalle_planilla;
};