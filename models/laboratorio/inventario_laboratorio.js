'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class inventario_insumos_laboratorios extends Model {
    static associate(models) {
      inventario_insumos_laboratorios.belongsTo(models.insumos_laboratorios, {
        foreignKey: "id_insumos_laboratorio",
      });
      inventario_insumos_laboratorios.hasMany(models.detalle_examenes, {
        foreignKey: "id_insumos_laboratorio",
      });
    }
  };
  inventario_insumos_laboratorios.init({
    existencia: {
      type: DataTypes.STRING,
      allowNull: false
    },
    existencia_minima: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_compra: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_insumos_laboratorio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'inventario_insumos_laboratorios',
  });
  return inventario_insumos_laboratorios;
};