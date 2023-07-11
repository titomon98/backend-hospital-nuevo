'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class medicamentos extends Model {
    static associate(models) {
      medicamentos.belongsTo(models.marcas, {
        foreignKey: "id_marca",
      });
      medicamentos.belongsTo(models.presentaciones, {
        foreignKey: "id_presentacion",
      });
      medicamentos.belongsTo(models.proveedores, {
        foreignKey: "id_proveedor",
      });
    }
  };
  medicamentos.init({
    anestesico: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
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
  }, {
    sequelize,
    modelName: 'medicamentos',
  });
  return medicamentos;
};