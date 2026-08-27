'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class voucher_honorarios extends Model {
  };
  voucher_honorarios.init({
    id_medico: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre_medico: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cantidad_pagada: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    // Monto entregado al médico y su desglose por vía de pago.
    cantidad_entregada: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true
    },
    pago_efectivo: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true
    },
    pago_transferencia_hospital: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true
    },
    pago_transferencia_paciente: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false
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
    },
  }, {
    sequelize,
    modelName: 'voucher_honorarios',
  });
  return voucher_honorarios;
};