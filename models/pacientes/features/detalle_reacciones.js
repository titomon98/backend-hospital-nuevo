'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class reacciones extends Model {
    static associate(models) {
        reacciones.belongsTo(models.alergias, {
        foreignKey: "id_alergias",
      });
    }
  };
  reacciones.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_alergias: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'detalle_reacciones',
  });
  return reacciones;
};