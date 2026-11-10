'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class factura extends Model {
    static associate(models) { 
    }
  };
  factura.init({
    numero: {
      type: DataTypes.STRING,
      allowNull: false
    },
    total: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Texto: el NIT puede llevar K o ser CF.
    nit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_cuenta_hospital: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_cuenta_laboratorio: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    imagen: {
      type: DataTypes.STRING,
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL (2,10)
    },
    fecha: {
      type: DataTypes.DATE
    },
    id_usuario: {
      type: DataTypes.INTEGER
    },
    // Ya no se usa en el CRUD; queda por los registros historicos.
    serie: {
      type: DataTypes.STRING
    },
    referencia_factura: {
      type: DataTypes.STRING
    },
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'facturas',
  });
  return factura;
};