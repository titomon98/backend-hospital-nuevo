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
      contenido: {
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
      id_expediente: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'expedientes',
            key: 'id'
        }
      },
      id_medico: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'medicos',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('recetas');
  }
};
