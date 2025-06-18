'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mantenimientos extends Model {
    static associate(models) {
      mantenimientos.belongsTo(models.equipos, {
        foreignKey: "id_equipo",
      });
    }
  };
  mantenimientos.init({
    fecha: {
      type: DataTypes.STRING,
      allowNull: false
    },
    costo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    siguiente: {
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
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'mantenimientos',
  });
  return mantenimientos;
};