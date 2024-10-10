'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class campo_examenes extends Model {
    static associate(models) {
      campo_examenes.belongsTo(models.examenes_almacenados, {
        foreignKey: "id_examenes_almacenados",
      }); 
    }
  };
  campo_examenes.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    valor_minimo: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    valor_maximo: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    unidades:{
      type: DataTypes.STRING,
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
    modelName: 'campo_examenes',
  });
  return campo_examenes;
};