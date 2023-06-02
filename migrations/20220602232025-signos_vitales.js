'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('signos_vitales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fecha_vital: {
        type: Sequelize.STRING,
        allowNull: false
      },
      temperatura: {
        type: Sequelize.STRING,
        allowNull: false
      },
      via_temperatura: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ritmo_cardiaco: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ritmo_respiracion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pas: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pad: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pam: {
        type: Sequelize.STRING,
        defaultValue: "0.00"
      },
      spo2: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fio2: {
        type: Sequelize.STRING,
        allowNull: false
      },
      via_fio2: {
        type: Sequelize.STRING,
        allowNull: false
      },
      o2: {
        type: Sequelize.STRING,
        allowNull: false
      },
      via_os: {
        type: Sequelize.STRING,
        allowNull: false
      },
      presion_venosa: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pulso_pedal: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dolor: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tipo_dolor: {
        type: Sequelize.STRING,
        allowNull: false
      },
      peso: {
        type: Sequelize.STRING,
        allowNull: false
      },
      medicion_peso: {
        type: Sequelize.STRING,
        allowNull: false
      },
      talla: {
        type: Sequelize.STRING,
        allowNull: false
      },
      imc: {
        type: Sequelize.STRING,
        defaultValue: "0.00"
      },
      superficie_corporal: {
        type: Sequelize.STRING,
        defaultValue: "0.00"
      },
      perimetro_abdominal: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tipo_perimetro_abdominal: {
        type: Sequelize.STRING,
        allowNull: false
      },
      perimetro_cefalico: {
        type: Sequelize.STRING,
        allowNull: false
      },
      notas: {
        type: Sequelize.STRING,
        allowNull: false
      },
      estado: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      id_paciente: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'pacientes',
            key: 'id'
        }
      },
      id_usuario: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'usuarios',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('signos_vitales');
  }
};
