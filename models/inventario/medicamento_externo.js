'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class medicamento_externo extends Model {
    static associate(models) {
      medicamento_externo.belongsTo(models.marcas, {
        foreignKey: "id_marca",
      });
      medicamento_externo.belongsTo(models.tipo_medicamentos, {
        foreignKey: "id_tipo_medicamento",
      });
      medicamento_externo.belongsTo(models.presentaciones, {
        foreignKey: "id_presentacion",
      });
    }
  };
  medicamento_externo.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false
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
    modelName: 'medicamento_externos',
  });
  return medicamento_externo;
};