'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class muestras_medicas extends Model {
    static associate(models) {
      muestras_medicas.belongsTo(models.marcas, {
        foreignKey: "id_marca",
      });
      muestras_medicas.belongsTo(models.presentaciones, {
        foreignKey: "id_presentacion",
      });
      muestras_medicas.belongsTo(models.proveedores, {
        foreignKey: "id_proveedor",
      });
      muestras_medicas.belongsTo(models.casa_medicas, {
        foreignKey: "id_muestra",
      });
    }
  };
  muestras_medicas.init({
    controlado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_costo: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    precio_venta: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    existencia_minima: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    existencia_actual: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_presentacion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_marca: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_muestra: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'muestras_medicas',
  });
  return muestras_medicas;
};