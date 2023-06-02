'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class resultado extends Model {
    static associate(models) {
      resultado.belongsTo(models.ordenes, {
        foreignKey: "id_orden",
      }); 
      resultado.hasMany(models.campo_resultados, {
        foreignKey: "id_resultado",
      });
    }
  };
  resultado.init({
    costo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'resultados',
  });
  return resultado;
};