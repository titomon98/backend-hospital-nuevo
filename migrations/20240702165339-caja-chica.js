'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('caja_chicas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cantidad: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nombre: {
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
      id_rubro: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'rubros',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('caja_chicas');
  }
};
