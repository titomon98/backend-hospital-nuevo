'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class examenes_realizados extends Model {
    static associate(models) {
      examenes_realizados.belongsTo(models.examenes_almacenados, {
        foreignKey: "id_examenes_almacenados",
      }); 
      examenes_realizados.belongsTo(models.encargados, {
        foreignKey: "id_encargado",
      }); 
    }
  };
  examenes_realizados.init({
    expediente: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cui: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    comision: {
      type: DataTypes.STRING,
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numero_muestra: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    referido: {
      type: DataTypes.STRING,
      allowNull: true
    },
    id_encargado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pagado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    por_pagar: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    id_examenes_almacenados: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    modelName: 'examenes_realizados',
  });
  return examenes_realizados;
};