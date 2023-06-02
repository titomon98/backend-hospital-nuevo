'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class nota extends Model {
    static associate(models) {
      nota.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
    }
  };
  nota.init({
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'notas',
  });
  return nota;
};