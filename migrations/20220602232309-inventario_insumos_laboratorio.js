'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inventario_insumos_laboratorios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      existencia: {
        type: Sequelize.STRING,
        allowNull: false
      },
      existencia_minima: {
        type: Sequelize.STRING,
        allowNull: false
      },
      precio_compra: {
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
      id_insumos_laboratorio: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'insumos_laboratorios',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('inventario_insumos_laboratorios');
  }
};
