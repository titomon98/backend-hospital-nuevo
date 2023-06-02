'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_gasto extends Model {
    static associate(models) {
      detalle_gasto.belongsTo(models.gastos, {
        foreignKey: "id_gastos",
      });
    }
  };
  detalle_gasto.init({
    fecha: {
        type: DataTypes.STRING,
        allowNull: false
      },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cantidad: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_gastos: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'detalle_gastos',
  });
  return detalle_gasto;
};