'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('arrendamientos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      inicio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fin: {
        type: Sequelize.DATE,
        allowNull: false
      },
      costo: {
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
      id_clinica: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'clinicas',
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
    await queryInterface.dropTable('arrendamientos');
  }
};
