'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class venta extends Model {
    static associate(models) {
      venta.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
      venta.hasMany(models.detalle_facturas, {
        foreignKey: "id_factura",
      });/* 
      venta.hasMany(models.documentos_facturas, {
        foreignKey: "id_venta",
      }); */
    }
  };
  venta.init({
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    total: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    factura: {
      type: DataTypes.STRING,
    },
    referencia_factura: {
      type: DataTypes.STRING,
    },
    serie: {
      type: DataTypes.STRING,
    },
    numero: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
    },
    direccion: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'facturas',
  });
  return venta;
};