'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ingresos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false
      },
      total: {
        type: Sequelize.STRING,
        allowNull: false
      },
      factura:{
          type: Sequelize.STRING,
          allowNull: false
        },
        descripcion:{
          type: Sequelize.STRING,
          allowNull: false
        },
        fecha:{
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
      id_usuario: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'usuarios',
            key: 'id'
        }
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ingresos');
  }
};
