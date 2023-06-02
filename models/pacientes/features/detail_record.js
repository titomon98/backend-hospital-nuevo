'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detail_record extends Model {
    static associate(models) {
      detail_record.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      detail_record.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  detail_record.init({
    contenido_digestivo: {
        type: DataTypes.TEXT,
      },
      estado_digestivo: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_respiratorio: {
        type: DataTypes.TEXT,
      },
      estado_respiratorio: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_cardiovascular: {
        type: DataTypes.TEXT,
      },
      estado_cardiovascular: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_urinario: {
        type: DataTypes.TEXT,
      },
      estado_urinario: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_femenino: {
        type: DataTypes.TEXT,
      },
      estado_femenino: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_endocrino: {
        type: DataTypes.TEXT,
      },
      estado_endocrino: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_osteo: {
        type: DataTypes.TEXT,
      },
      estado_osteo: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_nervioso: {
        type: DataTypes.TEXT,
      },
      estado_nervioso: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_sensorial: {
        type: DataTypes.TEXT,
      },
      estado_sensorial: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_piel: {
        type: DataTypes.TEXT,
      },
      estado_piel: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_habitus: {
        type: DataTypes.TEXT,
      },
      estado_habitus: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_cabeza: {
        type: DataTypes.TEXT,
      },
      estado_cabeza: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_faringe: {
        type: DataTypes.TEXT,
      },
      estado_faringe: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_cuello: {
        type: DataTypes.TEXT,
      },
      estado_cuello: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_torax: {
        type: DataTypes.TEXT,
      },
      estado_torax: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_precordial: {
        type: DataTypes.TEXT,
      },
      estado_precordial: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_glandulas: {
        type: DataTypes.TEXT,
      },
      estado_glandulas: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_abdomen: {
        type: DataTypes.TEXT,
      },
      estado_abdomen: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_genitales: {
        type: DataTypes.TEXT,
      },
      estado_genitales: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_extremidades: {
        type: DataTypes.TEXT,
      },
      estado_extremidades: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_columna: {
        type: DataTypes.TEXT,
      },
      estado_columna: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido_neurologica: {
        type: DataTypes.TEXT,
      },
      estado_neurologica: {
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
    modelName: 'detail_records',
  });
  return detail_record;
};