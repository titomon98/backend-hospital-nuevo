'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tipo_examenes', {
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
    await queryInterface.bulkInsert('tipo_examenes', [{
      nombre: 'Privado',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Fundación',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Hospital',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'IGSS',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Exonerado',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'G&T',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'RPN',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Otro',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tipo_examenes');
  }
};
