'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class medico extends Model {
    static associate(models) {
      medico.belongsTo(models.tipo_medicos, {
        foreignKey: "id_tipo_medico",
      });
      medico.belongsTo(models.especialidades, {
        foreignKey: "id_especialidad",
      });
      medico.hasMany(models.arrendamientos, {
        foreignKey: "id_medico",
      });
      medico.hasMany(models.consultas, {
        foreignKey: "id_medico",
      });
    }
  };
  medico.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    colegiado: {
      type: DataTypes.STRING,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tipo_medico: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_especialidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'medicos',
  });
  return medico;
};