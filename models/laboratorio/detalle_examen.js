'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_examen extends Model {
    static associate(models) {
      detalle_examen.belongsTo(models.examenes, {
        foreignKey: "id_examen",
      });
      detalle_examen.belongsTo(models.inventario_insumos_laboratorios, {
        foreignKey: "id_inventario_laboratorio",
      });
    }
  };
  detalle_examen.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_examen: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_inventario_laboratorio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'detalle_examenes',
  });
  return detalle_examen;
};