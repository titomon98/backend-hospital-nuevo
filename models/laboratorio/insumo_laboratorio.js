'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class insumos_laboratorios extends Model {
    static associate(models) {
      insumos_laboratorios.belongsTo(models.tipo_insumo_laboratorios, {
        foreignKey: "id_tipo_insumo_laboratorios",
      });
      insumos_laboratorios.hasMany(models.inventario_insumos_laboratorios, {
        foreignKey: "id_insumos_laboratorio",
      });
    }
  };
  insumos_laboratorios.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    existencia_total: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tipo_insumo_laboratorios: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'insumos_laboratorios',
  });
  return insumos_laboratorios;
};