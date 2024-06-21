'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class detalle_consumo_comun extends Model {
    static associate(models) {
        detalle_consumo_comun.belongsTo(models.comunes, {
        foreignKey: 'id_comun',
      });
        detalle_consumo_comun.belongsTo(models.cuentas, {
            foreignKey: 'id_cuenta',
          });
    }
  }
  detalle_consumo_comun.init({     
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
    }
  }, {
    sequelize,
    modelName: 'detalle_consumo_comun',
    timestamps: false,
  });
  return detalle_consumo_comun;
};
