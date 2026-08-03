'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class revision_consumos extends Model {
    static associate(models) {
      revision_consumos.belongsTo(models.cuentas, {
        foreignKey: 'id_cuenta'
      });
    }
  }
  revision_consumos.init({
    id_cuenta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // 1 = comprobado, 2 = inconsistencia reportada.
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reviewed_by: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'revision_consumos'
  });
  return revision_consumos;
};
