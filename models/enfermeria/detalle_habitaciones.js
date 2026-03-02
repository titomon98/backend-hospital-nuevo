'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_habitaciones extends Model {
    static associate(models) {
      detalle_habitaciones.belongsTo(models.cuentas, {
        foreignKey: 'id_cuenta',
      });
    }
  };
  detalle_habitaciones.init({
    id_cuenta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cuentas',
        key: 'id'
      }
    },
    tipo_habitacion: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    costo_base: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    ingreso: {
      type: DataTypes.DATE,
      allowNull: false
    },
    salida: {
      type: DataTypes.DATE
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: 'detalle_habitaciones',
  });
  return detalle_habitaciones;
};