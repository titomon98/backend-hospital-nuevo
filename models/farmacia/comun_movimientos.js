'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class comun_movimientos extends Model {
    static associate(models) {
      comun_movimientos.belongsTo(models.comunes, {
        foreignKey: "id_comun",
      });
    }
  };
  comun_movimientos.init({
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
    id_comun: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'comun_movimientos',
  });
  return comun_movimientos;
};