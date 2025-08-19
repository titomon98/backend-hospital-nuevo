'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class detalle_consumo_quirugicos extends Model {
    static associate(models) {
        detalle_consumo_quirugicos.belongsTo(models.quirurgicos, {
        foreignKey: 'id_quirurgico',
      });
        detalle_consumo_quirugicos.belongsTo(models.cuentas, {
            foreignKey: 'id_cuenta',
          });
    }
  }
  detalle_consumo_quirugicos.init({     
    id_quirurgico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quirurgicos',
        key: 'id'
        }
      },
    descripcion: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    cantidad: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    precio_venta: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    }, 
    total: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
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
    modelName: 'detalle_consumo_quirugicos',
    timestamps: false,
  });
  return detalle_consumo_quirugicos;
};
