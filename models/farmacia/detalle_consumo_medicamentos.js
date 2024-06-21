'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class detalle_consumo_medicamentos extends Model {
    static associate(models) {
        detalle_consumo_medicamentos.belongsTo(models.medicamentos, {
        foreignKey: 'id_medicamento',
      });
        detalle_consumo_medicamentos.belongsTo(models.cuentas, {
            foreignKey: 'id_cuenta',
          });
    }
  }
  detalle_consumo_medicamentos.init({     
    id_medicamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medicamentos',
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
    modelName: 'detalle_consumo_medicamentos',
    timestamps: false,
  });
  return detalle_consumo_medicamentos;
};
