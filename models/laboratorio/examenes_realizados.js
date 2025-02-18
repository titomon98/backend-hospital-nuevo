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
      examenes_realizados.belongsTo(models.lab_cuentas, {
        foreignKey: "id_lab_cuentas",
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
    edad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cui: {
      type: DataTypes.STRING,
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
    nombre_factura: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    id_encargado: {
      type: DataTypes.STRING,
      allowNull: true
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
    },
    id_cuenta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
    id_lab_cuentas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'examenes_realizados',
  });
  return examenes_realizados;
};