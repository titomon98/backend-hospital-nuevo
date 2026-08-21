'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class logs_eliminacion_pacientes extends Model {
    static associate(models) {
      logs_eliminacion_pacientes.belongsTo(models.expedientes, {
        foreignKey: 'id_expediente',
      });
    }
  }
  logs_eliminacion_pacientes.init({
    id_expediente: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_cuenta: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    numero_expediente: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombre_paciente: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipo_cuenta: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_cuenta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    tenia_consumos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'logs_eliminacion_pacientes',
  });
  return logs_eliminacion_pacientes;
};
