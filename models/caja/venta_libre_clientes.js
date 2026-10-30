'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // Clientes externos de venta libre (persona o empresa): solo nombre, en mayusculas.
  class venta_libre_clientes extends Model {}
  venta_libre_clientes.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    created_by: { type: DataTypes.STRING },
    updated_by: { type: DataTypes.STRING }
  }, {
    sequelize,
    modelName: 'venta_libre_clientes',
    tableName: 'venta_libre_clientes'
  });
  return venta_libre_clientes;
};
