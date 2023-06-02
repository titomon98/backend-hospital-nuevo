'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tipo_cobros', {
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
    await queryInterface.bulkInsert('tipo_cobros', [{
      nombre: 'EFECTIVO',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }, 
    {
      nombre: 'DEPÓSITO',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      nombre: 'TRANSFERENCIA',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      nombre: 'VISA',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tipo_cobros');
  }
};
