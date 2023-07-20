'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class quirurgicos extends Model {
    static associate(models) {
      quirurgicos.belongsTo(models.marcas, {
        foreignKey: "id_marca",
      });
      quirurgicos.belongsTo(models.presentaciones, {
        foreignKey: "id_presentacion",
      });
      quirurgicos.belongsTo(models.proveedores, {
        foreignKey: "id_proveedor",
      });
    }
  };
  quirurgicos.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_costo: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    existencia_minima_quirofano: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    existencia_actual_quirofano: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    existencia_minima_farmacia: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    existencia_actual_farmacia: {
      type: DataTypes.INTEGER,
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
    inventariado: {
      type: DataTypes.STRING,
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
    modelName: 'quirurgicos',
  });
  return quirurgicos;
};