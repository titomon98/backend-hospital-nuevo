'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('equipos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tiempo_uso: {
        type: Sequelize.STRING,
        allowNull: false
      },
      adquisicion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mantenimiento_previo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mantenimiento_siguiente: {
        type: Sequelize.STRING,
        allowNull: false
      },
      preparacion: {
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
      id_examen: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'examenes',
            key: 'id'
        }
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('equipos');
  }
};
