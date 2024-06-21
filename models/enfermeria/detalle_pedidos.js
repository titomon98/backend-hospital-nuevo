'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_pedido extends Model {
    static associate(models) {
      detalle_pedido.belongsTo(models.medicamentos, {
        foreignKey: "id_medicamento",
      });
      detalle_pedido.belongsTo(models.comunes, {
        foreignKey: "id_comun",
      });
      detalle_pedido.belongsTo(models.quirurgicos, {
        foreignKey: "id_quirurgico",
      });
      detalle_pedido.belongsTo(models.pedidos, {
        foreignKey: "id_pedido",
      });
    }
  };
  detalle_pedido.init({
    cantidad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_comun: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_medicamento: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_quirurgico: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_pedido: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'detalle_pedidos',
  });
  return detalle_pedido;
};