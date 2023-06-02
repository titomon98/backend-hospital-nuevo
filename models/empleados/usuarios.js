'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class usuario extends Model {
    static associate(models) {
      usuario.belongsTo(models.tipo_usuarios, {
        foreignKey: "id_tipo_usuario",
      });
      usuario.hasMany(models.alergias, {
        foreignKey: "id_usuario",
      })
      usuario.hasMany(models.signos_vitales, {
        foreignKey: "id_usuario",
      })
      usuario.hasMany(models.vitales_neuros, {
        foreignKey: "id_usuario",
      })
      usuario.hasMany(models.vitales_glicemias, {
        foreignKey: "id_usuario",
      })
      usuario.hasMany(models.recetas, {
        foreignKey: "id_usuario",
      })
      usuario.hasMany(models.documentos, {
        foreignKey: "id_usuario",
      })
      usuario.hasMany(models.cargos, {
        foreignKey: "id_usuario",
      })
      usuario.hasMany(models.pagos, {
        foreignKey: "id_usuario",
      })
      usuario.hasMany(models.diagnosticos, {
        foreignKey: "id_usuario",
      })
      usuario.hasMany(models.ordenes, {
        foreignKey: "id_usuario",
      })
    }
  };
  usuario.init({
    user: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
    },
    apellidos: {
      type: DataTypes.STRING,
    },
    telefono: {
      type: DataTypes.STRING,
    },
    correo: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tipo_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'usuarios',
  });
  return usuario;
};