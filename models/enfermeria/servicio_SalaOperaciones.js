'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class servicio_sala_operaciones extends Model {
    static associate(models) {
      servicio_sala_operaciones.belongsTo(models.cuentas, {
        foreignKey: 'id_cuenta',
      });
      servicio_sala_operaciones.belongsTo(models.categoria_sala_operaciones, {
        foreignKey: 'id_categoria',
      });
      servicio_sala_operaciones.hasMany(models.detalle_personals, {
        foreignKey: "id_servicio",
      });
    }
  }
  servicio_sala_operaciones.init({
    descripcion: {
      type: DataTypes.STRING(250),
      allowNull: true
    },    
    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categoria_sala_operaciones',
        key: 'id'
        }
      },
    horas: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: false
    }, 
    total: {
      type: DataTypes.DECIMAL(20, 6),
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
    modelName: 'servicio_sala_operaciones',
    timestamps: false,
  });
  return servicio_sala_operaciones;
};
