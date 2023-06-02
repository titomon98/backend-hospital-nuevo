'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class paciente extends Model {
    static associate(models) {
      paciente.belongsTo(models.idiomas, {
        foreignKey: "id_idioma",
        as: 'idiomas'
      });
      paciente.belongsTo(models.nacionalidades, {
        foreignKey: "id_nacionalidad",
        as: 'nacionalidades'
      });
      paciente.belongsTo(models.tipo_sangres, {
        foreignKey: "id_tipo_sangre",
        as: 'tipo_sangres'
      });
      paciente.hasMany(models.consultas, {
        foreignKey: "id_paciente",
      });
      paciente.hasMany(models.notas, {
        foreignKey: "id_paciente",
      });
      paciente.hasMany(models.cobros, {
        foreignKey: "id_paciente",
      });
      paciente.hasMany(models.ordenes, {
        foreignKey: "id_paciente",
      })
      paciente.hasMany(models.consulta_laboratorios, {
        foreignKey: "id_paciente",
      })
    }
  };
  paciente.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apellido_casada: {
      type: DataTypes.STRING,
    },
    sexo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nacimiento: {
      type: DataTypes.DATEONLY,
    },
    edad: {
      type: DataTypes.STRING,
    },
    direccion: {
      type: DataTypes.STRING,
    },
    estado_civil: {
      type: DataTypes.STRING,
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING,
    },
    num_expediente: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cui: {
      type: DataTypes.STRING,
    },
    cui_encargado: {
      type: DataTypes.STRING,
    },
    nombre_encargado: {
      type: DataTypes.STRING,
    },
    referente: {
      type: DataTypes.STRING,
    },
    procedencia: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado_express: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_idioma: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_nacionalidad: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_tipo_sangre: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'pacientes',
  });
  return paciente;
};