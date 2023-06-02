'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('detalle_examenes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
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
      id_examen: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'examenes',
            key: 'id'
        }
      },
      id_inventario_laboratorio: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'inventario_insumos_laboratorios',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('detalle_examenes');
  }
};
