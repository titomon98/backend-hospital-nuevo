'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('detalle_planillas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fecha: {
        type: Sequelize.STRING,
      },
      descripcion: {
        type: Sequelize.STRING,
      },
      num_cuenta: {
        type: Sequelize.STRING,
        allowNull: false
      },
      salario: {
          type: Sequelize.STRING,
          allowNull: false
      },
      bono: {
          type: Sequelize.STRING,
          allowNull: false
      },
      nit: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      igss: {
          type: Sequelize.STRING,
          allowNull: false
      },
      isr: {
          type: Sequelize.STRING,
          allowNull: false
      },
      prestamo: {
          type: Sequelize.STRING,
          allowNull: false
      },
      liquido: {
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
      id_planilla: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'planillas',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('detalle_planillas');
  }
};
