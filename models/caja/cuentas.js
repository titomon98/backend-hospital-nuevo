'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cuenta extends Model {
    static associate(models) {
        cuenta.belongsTo(models.expedientes, {
            foreignKey: "id_expediente",
        });
        cuenta.hasMany(models.consumos, {
            foreignKey: "id_cuenta",
        });
    }
  };
  cuenta.init({
    numero: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fecha_ingreso: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING,
    },
    otros: {
        type: DataTypes.STRING,
    },
    total: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_expediente: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
  }, {
    sequelize,
    modelName: 'cuentas',
  });
  return cuenta;
};