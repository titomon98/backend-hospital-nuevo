'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vitales_neuros', {
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
      escala_glasgow: {
        type: Sequelize.STRING,
        allowNull: false
      },
      motor: {
        type: Sequelize.STRING,
        allowNull: false
      },
      verbal: {
        type: Sequelize.STRING,
        allowNull: false
      },
      apertura_ojos: {
        type: Sequelize.STRING,
        allowNull: false
      },
      reaccion_izquierda: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tamano_izquierda: {
        type: Sequelize.STRING,
        allowNull: false
      },
      reaccion_derecha: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tamano_derecha: {
        type: Sequelize.STRING,
        allowNull: false
      },
      superior_izquierda: {
        type: Sequelize.STRING,
        allowNull: false
      },
      inferior_izquierda: {
        type: Sequelize.STRING,
        allowNull: false
      },
      superior_derecha: {
        type: Sequelize.STRING,
        allowNull: false
      },
      inferior_derecha: {
        type: Sequelize.STRING,
        allowNull: false
      },
      notas: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('vitales_neuros');
  }
};
