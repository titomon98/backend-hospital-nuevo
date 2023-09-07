'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_ingreso extends Model {
    static associate(models) {
      detalle_ingreso.belongsTo(models.medicamentos, {
        foreignKey: "id_medicamento",
      });
      detalle_ingreso.belongsTo(models.comunes, {
        foreignKey: "id_comun",
      });
      detalle_ingreso.belongsTo(models.quirurgicos, {
        foreignKey: "id_quirurgico",
      });
      detalle_ingreso.belongsTo(models.ingresos, {
        foreignKey: "id_ingreso",
      });
    }
  };
  detalle_ingreso.init({
    cantidad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pertenencia: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_medicamento: {
      type: DataTypes.INTEGER,
    },
    id_comun: {
        type: DataTypes.INTEGER,
      },
      id_quirurgico: {
        type: DataTypes.INTEGER,
      },
    id_ingreso: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'detalle_ingresos',
  });
  return detalle_ingreso;
};