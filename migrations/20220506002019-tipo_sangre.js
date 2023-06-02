'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tipo_sangres', {
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
    await queryInterface.bulkInsert('tipo_sangres', [{
      nombre: 'A+',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'A-',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'B+',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'B-',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'O+',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'O-',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'AB+',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'AB-',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tipo_sangres');
  }
};
