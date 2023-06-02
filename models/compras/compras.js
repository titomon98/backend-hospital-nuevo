'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class compra extends Model {
    static associate(models) {
      compra.belongsTo(models.proveedores, {
        foreignKey: "id_proveedor",
      });
      compra.belongsTo(models.partidas, {
        foreignKey: "id_partida",
      });
      compra.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
      compra.belongsTo(models.contribuyentes, {
        foreignKey: "id_contribuyente",
      });
      compra.belongsTo(models.destinos, {
        foreignKey: "id_destino",
      });
      compra.hasMany(models.detalle_compras, {
        foreignKey: "id_compra",
      });
    }
  };
  compra.init({
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_recibir: {
      type: DataTypes.DATEONLY,
    },
    total: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    razon_social: {
      type: DataTypes.STRING,
    },
    actividad_recreativa: {
      type: DataTypes.STRING,
    },
    factura: {
      type: DataTypes.STRING,
    },
    referencia_factura: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
    },
    id_partida: {
      type: DataTypes.INTEGER,
    },
    id_usuario: {
      type: DataTypes.INTEGER
    }, 
    id_contribuyente:{
      type: DataTypes.INTEGER
    },
    id_destino:{
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'compras',
  });
  return compra;
};