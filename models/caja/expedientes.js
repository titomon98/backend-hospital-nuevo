'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class expediente extends Model {
    static associate(models) {
      expediente.hasMany(models.cuentas, {
        foreignKey: "id_expediente",
      });
    }
  };
  expediente.init({
    expediente: {
      type: DataTypes.STRING,
      allowNull: false
    },
    primer_ingreso: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false
    },
    casada: {
      type: DataTypes.STRING,
    },
    nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    cui: {
      type: DataTypes.STRING,
    },
    nacionalidad: {
      type: DataTypes.STRING,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre_encargado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contacto_encargado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parentesco_encargado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'expedientes',
  });
  return expediente;
};