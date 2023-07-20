'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class medicamentos_movimientos extends Model {
    static associate(models) {
      medicamentos_movimientos.belongsTo(models.medicamentos, {
        foreignKey: "id_medicamento",
      });
    }
  };
  medicamentos_movimientos.init({
    cantidad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    existencia_previa: {
      type: DataTypes.STRING,
      allowNull: false
    },
    existencia_nueva: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_costo: {
      type: DataTypes.STRING,
    },
    precio_venta: {
      type: DataTypes.STRING,
    },
    movimiento: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_medicamento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'medicamentos_movimientos',
  });
  return medicamentos_movimientos;
};