'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('recetas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      medicamento: {
        type: Sequelize.STRING,
        allowNull: false
      },
      via: {
        type: Sequelize.STRING,
      },
      frecuencia: {
        type: Sequelize.STRING,
      },
      tipo: {
        type: Sequelize.STRING,
      },
      farmacia: {
        type: Sequelize.STRING,
      },
      iniciar: {
        type: Sequelize.STRING,
      },
      ultima_toma: {
        type: Sequelize.STRING,
      },
      observaciones: {
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
    await queryInterface.dropTable('recetas');
  }
};
