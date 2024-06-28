'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class seguro extends Model {
    static associate(models) {
        seguro.belongsTo(models.aseguradoras, {
            foreignKey: "id_aseguradora",
        });
        seguro.belongsTo(models.expedientes, {
            foreignKey: "id_expediente",
        });
        seguro.belongsTo(models.detalle_pago_cuentas, {
            foreignKey: "id_detalle_pago_cuentas",
        });
    }
  };
  seguro.init({
    no_poliza: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre_asegurado: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tel_asegurado: {
        type: DataTypes.STRING,
        allowNull: true
    },
    correo_asegurado: {
        type: DataTypes.STRING,
        allowNull: true
    },
    solvente: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'seguros',
  });
  return seguro;
};