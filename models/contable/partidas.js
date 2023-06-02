'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class partida extends Model {
    static associate(models) {
      partida.hasMany(models.ventas, {
        foreignKey: "id_partida",
      });
      partida.hasMany(models.compras, {
        foreignKey: "id_partida",
      });
      partida.hasMany(models.detalle_partidas, {
        foreignKey: "id_partida",
      });
      partida.hasMany(models.movimientos, {
        foreignKey: "id_partida",
      });
    }
  };
  partida.init({
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    moneda: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tasa: {
      type: DataTypes.STRING,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      iva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    
  }, {
    sequelize,
    modelName: 'partidas',
  });
  return partida;
};