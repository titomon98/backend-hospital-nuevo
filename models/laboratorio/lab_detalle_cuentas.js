'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class labDetalleCuentas extends Model {
    static associate(models) {
      labDetalleCuentas.belongsTo(models.lab_cuentas, {
          foreignKey: "id_lab_cuenta",
      });
    }
  };
  labDetalleCuentas.init({
    Descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    costo: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    id_examen:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_lab_cuenta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'lab_detalle_cuentas',
  });
  return labDetalleCuentas;
};