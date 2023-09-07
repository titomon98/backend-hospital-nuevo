'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('detalle_ingresos', {
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
      subtotal: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pertenencia: {
        type: Sequelize.STRING,
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
      id_ingreso: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'ingresos',
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
    await queryInterface.dropTable('detalle_ingresos');
  }
};
