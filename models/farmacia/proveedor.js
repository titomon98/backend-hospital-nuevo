'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class proveedores extends Model {
    static associate(models) {
      proveedores.hasMany(models.medicamentos, {
        foreignKey: "id_proveedor",
      });
      proveedores.hasMany(models.muestras_medicas, {
        foreignKey: "id_proveedor",
      });
      proveedores.hasMany(models.comunes, {
        foreignKey: "id_proveedor",
      });
      proveedores.hasMany(models.quirurgicos, {
        foreignKey: "id_proveedor",
      });
    }
  };
  proveedores.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    representante: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    total_adquirido: {
      type: DataTypes.DECIMAL(10,2)
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING,
    },
    empresa: {
      type: DataTypes.STRING,
    },
    direccion: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'proveedores',
  });
  return proveedores;
};