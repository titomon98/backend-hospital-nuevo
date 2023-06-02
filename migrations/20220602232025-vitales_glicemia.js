'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vitales_glicemias', {
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
      glucosa_sanguinea: {
        type: Sequelize.STRING,
        allowNull: false
      },
      rbs: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fbs: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ppbs: {
        type: Sequelize.STRING,
        allowNull: false
      },
      hba1c: {
        type: Sequelize.STRING,
        allowNull: false
      },
      insulina_regular: {
        type: Sequelize.STRING,
        allowNull: false
      },
      intermediario_insulina: {
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
    await queryInterface.dropTable('vitales_glicemias');
  }
};
