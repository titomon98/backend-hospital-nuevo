'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class campo_examen extends Model {
    static associate(models) {
      campo_examen.belongsTo(models.examenes, {
        foreignKey: "id_examen",
      });
      campo_examen.hasMany(models.campo_resultados, {
        foreignKey: "id_campo_examen",
      });
    }
  };
  campo_examen.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_examen: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'campo_examenes',
  });
  return campo_examen;
};