'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class asuetos extends Model {};
  asuetos.init({
      nombre: {
        type: DataTypes.STRING(250),
        allowNull: false
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
    sequelize,
    modelName: 'asuetos',
  });
  return asuetos;
};