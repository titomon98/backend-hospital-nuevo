'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('consumos', {
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
      descripcion: {
          type: Sequelize.STRING,
          allowNull: false
      },
      subtotal: {
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
      id_cuenta: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'cuentas',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('consumos');
  }
};
