'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tipos_encargados extends Model {
    static associate(models) {
      /* banco.hasMany(models.cuenta_bancarias, {
        foreignKey: "id_banco",
      }); */
      tipos_encargados.hasMany(models.encargados, {
        foreignKey: "id_tipo_encargado"
      })
    }
  };
  tipos_encargados.init({
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'tipos_encargados',
  });
  return tipos_encargados;
};