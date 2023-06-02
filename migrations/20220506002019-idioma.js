'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('idiomas', {
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
    await queryInterface.bulkInsert('idiomas', [{
      nombre: 'ESPAÑOL',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'INGLÉS',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'KAQCHIKEL',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: "K'ICHE'",
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'MAM',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('idiomas');
  }
};
