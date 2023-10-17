'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('habitaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numero: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      costo_ambulatorio: {
        type: Sequelize.STRING,
        allowNull: false
      },
      costo_diario: {
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
    await queryInterface.bulkInsert('habitaciones', [{
      numero: '1',
      tipo: 'Privada',
      costo_ambulatorio: '0.00',
      costo_diario: '0.00',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      numero: '2',
      tipo: 'Privada',
      costo_ambulatorio: '0.00',
      costo_diario: '0.00',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      numero: '3',
      tipo: 'Privada',
      costo_ambulatorio: '0.00',
      costo_diario: '0.00',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      numero: '4',
      tipo: 'Privada',
      costo_ambulatorio: '0.00',
      costo_diario: '0.00',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      numero: '5',
      tipo: 'Especial',
      costo_ambulatorio: '0.00',
      costo_diario: '0.00',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      numero: '6A',
      tipo: 'Semi-privada',
      costo_ambulatorio: '0.00',
      costo_diario: '0.00',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      numero: '6B',
      tipo: 'Semi-privada',
      costo_ambulatorio: '0.00',
      costo_diario: '0.00',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      numero: '7A',
      tipo: 'Semi-privada',
      costo_ambulatorio: '0.00',
      costo_diario: '0.00',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      numero: '7B',
      tipo: 'Semi-privada',
      costo_ambulatorio: '0.00',
      costo_diario: '0.00',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      numero: '8',
      tipo: 'Especial',
      costo_ambulatorio: '0.00',
      costo_diario: '0.00',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      numero: '9A',
      tipo: 'Intensivo',
      costo_ambulatorio: '0.00',
      costo_diario: '0.00',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      numero: '9B',
      tipo: 'Semi-privada',
      costo_ambulatorio: '0.00',
      costo_diario: '0.00',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('habitaciones');
  }
};
