'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('detalle_pedidos', {
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
      id_paquete: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'paquetes',
            key: 'id'
        }
      },
      id_medicamento: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'medicamentos',
            key: 'id'
        }
      },
      id_comun: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'comunes',
            key: 'id'
        }
      },
      id_quirurgico: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'quirurgicos',
            key: 'id'
        }
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('detalle_pedidos');
  }
};
