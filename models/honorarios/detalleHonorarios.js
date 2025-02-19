'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class detalle_honorarios extends Model {
    static associate(models) {
      detalle_honorarios.belongsTo(models.medicos, {
        foreignKey: 'id_medico',
      });
      detalle_honorarios.belongsTo(models.cuentas, {
        foreignKey: 'id_cuenta',
      });
    }
  }
  detalle_honorarios.init({
    id_medico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medicos',
        key: 'id'
      }
    },
    id_cuenta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cuentas',
        key: 'id'
      }
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lugar: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: 'detalle_honorarios',
    timestamps: false,
  });
  return detalle_honorarios;
};
