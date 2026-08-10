'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_personal extends Model {
    static associate(models) {
        detalle_personal.belongsTo(models.personals, {
            foreignKey: "id_personal",
        });
        // id_servicio se relaciona con el catalogo `servicios` (roles de personal
        // 9-14 en Quirofano). No tiene relacion con servicio_sala_operaciones.
        detalle_personal.belongsTo(models.servicios, {
            foreignKey: "id_servicio",
        });
    }
  };
  detalle_personal.init({
    descripcion: {
      type: DataTypes.STRING
    },
    id_personal: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_servicio: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
  }, {
    sequelize,
    modelName: 'detalle_personals',
  });
  return detalle_personal;
};