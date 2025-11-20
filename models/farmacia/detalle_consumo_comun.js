'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class detalle_consumo_comunes extends Model {
    static associate(models) {
        detalle_consumo_comunes.belongsTo(models.comunes, {
        foreignKey: 'id_comun',
      });
        detalle_consumo_comunes.belongsTo(models.cuentas, {
            foreignKey: 'id_cuenta',
          });
    }
  }
  detalle_consumo_comunes.init({     
    id_comun: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'comunes',
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
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'detalle_consumo_comunes',
    timestamps: false,
  });
  return detalle_consumo_comunes;
};
