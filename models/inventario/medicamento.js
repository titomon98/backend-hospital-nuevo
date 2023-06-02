'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class medicamento extends Model {
    static associate(models) {
      medicamento.belongsTo(models.marcas, {
        foreignKey: "id_marca",
      });
      medicamento.belongsTo(models.tipo_medicamentos, {
        foreignKey: "id_tipo_medicamento",
      });
      medicamento.belongsTo(models.presentaciones, {
        foreignKey: "id_presentacion",
      });
      medicamento.hasMany(models.inventarios, {
        foreignKey: "id_medicamento",
      });
    }
  };
  medicamento.init({
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
    precio_costo: {
      type: DataTypes.STRING,
    },
    precio_publico: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_marca: {
      type: DataTypes.INTEGER,
    },
    id_tipo_medicamento: {
      type: DataTypes.INTEGER,
    },
    id_presentacion: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'medicamentos',
  });
  return medicamento;
};