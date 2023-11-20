'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cuentas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numero: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fecha_ingreso: {
          type: Sequelize.DATEONLY,
          allowNull: false
      },
      motivo: {
          type: Sequelize.STRING,
          allowNull: false
      },
      descripcion: {
          type: Sequelize.STRING,
          allowNull: false
      },
      otros: {
          type: Sequelize.STRING,
          allowNull: false
      },
      total: {
          type: Sequelize.DECIMAL(10,2),
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
      id_expediente: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'expedientes',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cuentas');
  }
};
