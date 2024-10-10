'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ingreso extends Model {
    static associate(models) {
      ingreso.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
      ingreso.hasMany(models.detalle_ingresos, {
        foreignKey: "id_ingreso",
      });
    }
  };
  ingreso.init({
    total: {
      type: DataTypes.STRING,
      allowNull: false
    },
    factura:{
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion:{
      type: DataTypes.STRING,
      allowNull: false
    },
    fecha:{
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
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'ingresos',
  });
  return ingreso;
};