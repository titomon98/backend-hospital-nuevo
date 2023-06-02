'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class vitales_neuro extends Model {
    static associate(models) {
      vitales_neuro.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      vitales_neuro.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  vitales_neuro.init({
    fecha_vital: {
      type: DataTypes.STRING,
      allowNull: false
    },
    escala_glasgow: {
        type: DataTypes.STRING,
        allowNull: false
      },
      motor: {
        type: DataTypes.STRING,
        allowNull: false
      },
      verbal: {
        type: DataTypes.STRING,
        allowNull: false
      },
      apertura_ojos: {
        type: DataTypes.STRING,
        allowNull: false
      },
      reaccion_izquierda: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tamano_izquierda: {
        type: DataTypes.STRING,
        allowNull: false
      },
      reaccion_derecha: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tamano_derecha: {
        type: DataTypes.STRING,
        allowNull: false
      },
      superior_izquierda: {
        type: DataTypes.STRING,
        allowNull: false
      },
      inferior_izquierda: {
        type: DataTypes.STRING,
        allowNull: false
      },
      superior_derecha: {
        type: DataTypes.STRING,
        allowNull: false
      },
      inferior_derecha: {
        type: DataTypes.STRING,
        allowNull: false
      },
      notas: {
        type: DataTypes.STRING,
      },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
  }, {
    sequelize,
    modelName: 'vitales_neuros',
  });
  return vitales_neuro;
};