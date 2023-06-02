'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class movimiento extends Model {
    static associate(models) {
      movimiento.belongsTo(models.cuenta_bancarias, {
        foreignKey: "id_cuenta_bancaria",
      });
      movimiento.belongsTo(models.partidas, {
        foreignKey: "id_partida",
      });
    }
  };
  movimiento.init({
    numero_movimiento: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo: {
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
    id_cuenta_bancaria: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_partida: {
        type: DataTypes.INTEGER,
      },
  }, {
    sequelize,
    modelName: 'movimientos',
  });
  return movimiento;
};