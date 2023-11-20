'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class consumo extends Model {
    static associate(models) {
        consumo.belongsTo(models.cuentas, {
            foreignKey: "id_cuenta",
        });
    }
  };
  consumo.init({
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
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_cuenta: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
  }, {
    sequelize,
    modelName: 'consumos',
  });
  return consumo;
};