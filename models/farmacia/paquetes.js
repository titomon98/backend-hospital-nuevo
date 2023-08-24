'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class paquete extends Model {
    static associate(models) {
      paquete.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
      paquete.hasMany(models.detalle_paquetes, {
        foreignKey: "id_paquete",
      });
    }
  };
  paquete.init({
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
  }, {
    sequelize,
    modelName: 'paquetes',
  });
  return paquete;
};