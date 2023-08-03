'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_paquete extends Model {
    static associate(models) {
      detalle_paquete.belongsTo(models.medicamentos, {
        foreignKey: "id_medicamento",
      });
      detalle_paquete.belongsTo(models.comunes, {
        foreignKey: "id_comun",
      });
      detalle_paquete.belongsTo(models.quirurgicos, {
        foreignKey: "id_quirurgico",
      });
      detalle_paquete.belongsTo(models.paquetes, {
        foreignKey: "id_paquete",
      });
    }
  };
  detalle_paquete.init({
    cantidad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pertenencia: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_medicamento: {
      type: DataTypes.INTEGER,
    },
    id_comun: {
        type: DataTypes.INTEGER,
      },
      id_quirurgico: {
        type: DataTypes.INTEGER,
      },
    id_paquete: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'detalle_paquetes',
  });
  return detalle_paquete;
};