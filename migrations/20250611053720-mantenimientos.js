'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mantenimientos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fecha: {
          type: Sequelize.STRING,
          allowNull: false
      },
      costo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      siguiente: {
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
      created_by: {
        type: Sequelize.STRING
      },
      updated_by: {
        type: Sequelize.STRING
      },
      id_equipo: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'equipos',
            key: 'id'
        }
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('mantenimientos');
    }
  }
};
