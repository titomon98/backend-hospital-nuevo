'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pedido extends Model {
    static associate(models) {
      pedido.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
      pedido.hasMany(models.detalle_pedidos, {
        foreignKey: "id_pedido",
      });
    }
  };
  pedido.init({
    codigoPedido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cantidadUnidades: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha:{
      type: DataTypes.DATE,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'pedidos',
  });
  return pedido;
};