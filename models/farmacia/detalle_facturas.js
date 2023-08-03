'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_factura extends Model {
    static associate(models) {
    detalle_factura.belongsTo(models.medicamentos, {
        foreignKey: "id_medicamento",
    });
    detalle_factura.belongsTo(models.comunes, {
        foreignKey: "id_comun",
    });
    detalle_factura.belongsTo(models.quirurgicos, {
        foreignKey: "id_quirurgico",
    });
    detalle_factura.belongsTo(models.facturas, {
        foreignKey: "id_factura",
    });
    }
  };
  detalle_factura.init({
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
    id_factura: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'detalle_facturas',
  });
  return detalle_factura;
};