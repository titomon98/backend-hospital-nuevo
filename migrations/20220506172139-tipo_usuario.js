'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tipo_usuarios', {
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
    await queryInterface.bulkInsert('tipo_usuarios', [{
      nombre: 'Administración',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Recepción',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Caja',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Finanzas',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Laboratorio',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Dr. Gálvez',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tipo_usuarios');
  }
};
