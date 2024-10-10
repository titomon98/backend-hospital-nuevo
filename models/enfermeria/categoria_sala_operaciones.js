'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class categoria_sala_operaciones extends Model {
    static associate(models) {
      /*categoria_sala_operaciones.belongsTo(models.cuentas, {
        foreignKey: 'id_cuenta',
      });*/
    }
  }
  categoria_sala_operaciones.init({
    categoria: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    precio: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: false
    },
    cobro_extra: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: false
    },     
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    },
  }, {
    sequelize,
    modelName: 'categoria_sala_operaciones',
    timestamps: false,
  });
  return categoria_sala_operaciones;
};
