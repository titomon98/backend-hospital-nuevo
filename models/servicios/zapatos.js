'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class zapato extends Model {
    static associate(models) {
      zapato.belongsTo(models.colores, {
        foreignKey: "id_color",
      });
      zapato.belongsTo(models.marcas, {
        foreignKey: "id_marca",
      });
      zapato.belongsTo(models.clasificaciones, {
        foreignKey: "id_clasificacion",
      });
    }
  };
  zapato.init({
    estilo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    caracteristicas: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_costo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_venta: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_minimo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio_mayorista: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_color: {
      type: DataTypes.INTEGER
    },
    id_marca: {
      type: DataTypes.INTEGER
    },
    id_clasificacion: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'zapatos',
  });
  return zapato;
};