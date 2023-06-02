'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_permiso extends Model {
    static associate(models) {
      detalle_permiso.belongsTo(models.tipo_usuarios, {
        foreignKey: "id_tipo_usuario",
      });
      detalle_permiso.belongsTo(models.permisos, {
        foreignKey: "id_permiso",
      });
    }
  };
  detalle_permiso.init({
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tipo_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_permiso: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'detalle_permisos',
  });
  return detalle_permiso;
};