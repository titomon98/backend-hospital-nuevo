'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class record extends Model {
    static associate(models) {
      record.belongsTo(models.records, {
        foreignKey: "id_record",
      });
    }
  };
  record.init({
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_record: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'record_logs',
  });
  return record;
};