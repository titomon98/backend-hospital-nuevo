'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cobro extends Model {
    static associate(models) {
      cobro.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
    }
  };
  cobro.init({
    total: {
      type: DataTypes.STRING,
      allowNull: false
    },
    metodo_pago: {
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
    modelName: 'cobros',
  });
  return cobro;
};