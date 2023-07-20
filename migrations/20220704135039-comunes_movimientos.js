'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('comunes_movimientos', {
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
      existencia_previa: {
        type: Sequelize.STRING,
        allowNull: false
      },
      precio_costo: {
        type: Sequelize.STRING,
      },
      precio_venta: {
        type: Sequelize.STRING,
      },
      movimiento: {
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
      id_comun: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'comunes',
            key: 'id'
        }
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('comunes_movimientos');
  }
};
