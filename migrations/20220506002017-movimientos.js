'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('movimientos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numero_movimiento: {
        type: Sequelize.STRING,
      },
      tipo: {
        type: Sequelize.STRING,
      },
      cantidad: {
        type: Sequelize.DECIMAL(10, 2),
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
      id_cuenta_bancaria: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'cuenta_bancarias',
            key: 'id'
        }
      },
      id_partida: {
        type: Sequelize.INTEGER,
        references: {
            model: 'partidas',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('movimientos');
  }
};
