'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('detalle_consumo_medicamentos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_medicamento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'medicamentos',
          key: 'id'
        }
      },
      descripcion: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      cantidad: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false
      },
      precio_venta: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false
      },
      total: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false
      },
      id_cuenta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cuentas',
          key: 'id'
        }
      },      
      estado: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: { allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('detalle_consumo_medicamentos');
  }
};
