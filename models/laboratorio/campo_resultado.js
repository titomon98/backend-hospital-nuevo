'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class campo_resultado extends Model {
    static associate(models) {
      campo_resultado.belongsTo(models.resultados, {
        foreignKey: "id_resultado",
      }); 
      campo_resultado.belongsTo(models.campo_examenes, {
        foreignKey: "id_campo_examen",
      }); 
    }
  };
  campo_resultado.init({
    valor_resultado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_resultado: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_campo_examen: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'campo_resultados',
  });
  return campo_resultado;
};