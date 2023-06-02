'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class vitales_glicemia extends Model {
    static associate(models) {
      vitales_glicemia.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      vitales_glicemia.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  vitales_glicemia.init({
    fecha_vital: {
      type: DataTypes.STRING,
      allowNull: false
    },
    glucosa_sanguinea: {
        type: DataTypes.STRING,
        allowNull: false
      },
      rbs: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fbs: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ppbs: {
        type: DataTypes.STRING,
        allowNull: false
      },
      hba1c: {
        type: DataTypes.STRING,
        allowNull: false
      },
      insulina_regular: {
        type: DataTypes.STRING,
        allowNull: false
      },
      intermediario_insulina: {
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
    modelName: 'vitales_glicemias',
  });
  return vitales_glicemia;
};