'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class signos_vitales extends Model {
    static associate(models) {
      signos_vitales.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      signos_vitales.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  signos_vitales.init({
    fecha_vital: {
      type: DataTypes.STRING,
      allowNull: false
    },
    temperatura: {
        type: DataTypes.STRING,
        allowNull: false
      },
      via_temperatura: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ritmo_cardiaco: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ritmo_respiracion: {
        type: DataTypes.STRING,
        allowNull: false
      },
      pas: {
        type: DataTypes.STRING,
        allowNull: false
      },
      pad: {
        type: DataTypes.STRING,
        allowNull: false
      },
      pam: {
        type: DataTypes.STRING,
        defaultValue: "0.00"
      },
      spo2: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fio2: {
        type: DataTypes.STRING,
        allowNull: false
      },
      via_fio2: {
        type: DataTypes.STRING,
        allowNull: false
      },
      o2: {
        type: DataTypes.STRING,
        allowNull: false
      },
      via_os: {
        type: DataTypes.STRING,
        allowNull: false
      },
      presion_venosa: {
        type: DataTypes.STRING,
        allowNull: false
      },
      pulso_pedal: {
        type: DataTypes.STRING,
        allowNull: false
      },
      dolor: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tipo_dolor: {
        type: DataTypes.STRING,
        allowNull: false
      },
      peso: {
        type: DataTypes.STRING,
        allowNull: false
      },
      medicion_peso: {
        type: DataTypes.STRING,
        allowNull: false
      },
      talla: {
        type: DataTypes.STRING,
        allowNull: false
      },
      imc: {
        type: DataTypes.STRING,
        defaultValue: "0.00"
      },
      superficie_corporal: {
        type: DataTypes.STRING,
        defaultValue: "0.00"
      },
      perimetro_abdominal: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tipo_perimetro_abdominal: {
        type: DataTypes.STRING,
        allowNull: false
      },
      perimetro_cefalico: {
        type: DataTypes.STRING,
        allowNull: false
      },
      notas: {
        type: DataTypes.STRING,
      },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
  }, {
    sequelize,
    modelName: 'signos_vitales',
  });
  return signos_vitales;
};