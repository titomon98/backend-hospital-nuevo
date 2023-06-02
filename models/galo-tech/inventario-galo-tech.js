'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class inventario extends Model {
    static associate(models) {
      inventario.belongsTo(models.equipo_galo_techs, {
        foreignKey: "id_equipo",
      });
    }
  };
  inventario.init({
    existencia: {
      type: DataTypes.STRING,
      allowNull: false
    },
    existencia_minima: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_costo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_publico: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_equipo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'inventario_galo_techs',
  });
  return inventario;
};