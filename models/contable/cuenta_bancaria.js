'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cuenta_bancaria extends Model {
    static associate(models) {
      cuenta_bancaria.belongsTo(models.bancos, {
        foreignKey: "id_banco",
      });
      cuenta_bancaria.belongsTo(models.tipo_cuentas, {
        foreignKey: "id_tipo_cuenta",
      });
      cuenta_bancaria.hasMany(models.movimientos, {
        foreignKey: "id_cuenta_bancaria",
      });
    }
  };
  cuenta_bancaria.init({
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
    numero_cuenta_bancaria: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cantidad: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_banco: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tipo_cuenta: {
        type: DataTypes.INTEGER,
      },
  }, {
    sequelize,
    modelName: 'cuenta_bancarias',
  });
  return cuenta_bancaria;
};