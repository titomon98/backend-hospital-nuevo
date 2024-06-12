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
      expediente.hasMany(models.recetas, {
        foreignKey: "id_expediente",
      });
      expediente.hasMany(models.detalle_habitaciones, {
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
      allowNull: false
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
    genero: {
      type: DataTypes.STRING,
    },
    //encargado
    nombre_encargado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contacto_encargado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cui_encargado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parentesco_encargado: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    //nuevos atributos
    estado_civil: {
      type: DataTypes.STRING
    },
    profesion: {
      type: DataTypes.STRING
    },
    nombre_padre: {
      type: DataTypes.STRING
    },
    nombre_madre: {
      type: DataTypes.STRING
    },
    lugar_nacimiento: {
      type: DataTypes.STRING
    },
    estado_civil_encargado: {
      type: DataTypes.STRING
    },
    profesion_encargado: {
      type: DataTypes.STRING
    },
    direccion_encargado: {
      type: DataTypes.STRING
    },
    nombre_conyuge: {
      type: DataTypes.STRING
    },
    direccion_conyuge: {
      type: DataTypes.STRING
    },
    telefono_conyuge: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'expedientes',
  });
  return expediente;
};