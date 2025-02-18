'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cuenta extends Model {
    static associate(models) {
        cuenta.belongsTo(models.expedientes, {
            foreignKey: "id_expediente",
        });
        cuenta.hasMany(models.consumos, {
            foreignKey: "id_cuenta",
        });
        cuenta.hasMany(models.detalle_pago_cuentas, {
          foreignKey: "id_cuenta",
      });
    }
  };
  cuenta.init({
    numero: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fecha_ingreso: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    descripcion: {
        type: DataTypes.STRING,
    },
    otros: {
        type: DataTypes.STRING,
    },
    total: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_pagado: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0
    },
    pendiente_de_pago: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0
    },
    descuento: {
      type: DataTypes.DECIMAL(10,2)
    },
    solicitud_descuento: {
      type: DataTypes.INTEGER
    },
    subtotal: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0
    },
    id_expediente: {
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
    modelName: 'cuentas',
  });
  return cuenta;
};
