'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('partidas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      moneda: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tasa: {
        type: Sequelize.STRING,
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
      },
      iva: {
        type: Sequelize.DECIMAL(10, 2),
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
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
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('partidas');
  }
};
