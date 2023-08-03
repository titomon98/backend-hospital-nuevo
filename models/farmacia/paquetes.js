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
      venta.hasMany(models.detalle_paquetes, {
        foreignKey: "id_paquete",
      });
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
    nombre:{
        type: DataTypes.STRING,
        allowNull: false
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
    modelName: 'paquetes',
  });
  return venta;
};