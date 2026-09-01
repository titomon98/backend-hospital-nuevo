'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class logs_ajuste_sala_operaciones extends Model {
    static associate(models) {
      logs_ajuste_sala_operaciones.belongsTo(models.expedientes, {
        foreignKey: 'id_expediente',
      });
    }
  }
  logs_ajuste_sala_operaciones.init({
    id_servicio: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_cuenta: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_expediente: {
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
    total_anterior: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: true,
    },
    total_nuevo: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: true,
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'logs_ajuste_sala_operaciones',
    tableName: 'logs_ajuste_sala_operaciones',
  });
  return logs_ajuste_sala_operaciones;
};
