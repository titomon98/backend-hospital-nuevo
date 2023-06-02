'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('planillas', {
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
      num_cuenta: {
        type: Sequelize.STRING,
        allowNull: false
      },
      salario: {
          type: Sequelize.STRING,
          allowNull: false
      },
      bono: {
          type: Sequelize.STRING,
          allowNull: false
      },
      nit: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cargo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      igss: {
          type: Sequelize.STRING,
          allowNull: false
      },
      isr: {
          type: Sequelize.STRING,
          allowNull: false
      },
      prestamo: {
          type: Sequelize.STRING,
          allowNull: false
      },
      liquido: {
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
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('planillas');
  }
};
