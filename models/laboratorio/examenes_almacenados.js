'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class examenes_almacenados extends Model {
    static associate(models) {
        
    }
  };
  examenes_almacenados.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_normal: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    precio_sobrecargo: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    precio_costo: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    tipo_examen:{
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'examenes_almacenados',
  });
  return examenes_almacenados;
};