'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('servicio_sala_operaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      descripcion: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      precio: {
        type: Sequelize.DECIMAL(20,2),
        allowNull: false
      },      
      horas: {
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
    await queryInterface.dropTable('servicio_sala_operaciones');
  }
};
