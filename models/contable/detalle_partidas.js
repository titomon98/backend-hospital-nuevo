'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_partida extends Model {
    static associate(models) {
      detalle_partida.belongsTo(models.nomenclaturas, {
        foreignKey: "id_rubro",
      });
      detalle_partida.belongsTo(models.partidas, {
        foreignKey: "id_partida",
      });
    }
  };
  detalle_partida.init({
    posicion: {
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
    id_rubro: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_partida: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
  }, {
    sequelize,
    modelName: 'detalle_partidas',
  });
  return detalle_partida;
};