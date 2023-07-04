'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class proveedores extends Model {
    static associate(models) {
      
    }
  };
  /* Nombre
Representante(s)
Nit
Total de adquirido
Teléfono(s)
Correo(s)
Empresa
Dirección */
  proveedores.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'proveedores',
  });
  return proveedores;
};