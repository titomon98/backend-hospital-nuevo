'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medicamentos', {
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
      codigo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      existencia_total: {
        type: Sequelize.STRING,
        allowNull: false
      },
      precio_costo: {
        type: Sequelize.STRING,
      },
      precio_publico: {
        type: Sequelize.STRING,
      },
      estado: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      id_marca: {
        type: Sequelize.INTEGER,
        references: {
            model: 'marcas',
            key: 'id'
        }
      },
      id_tipo_medicamento: {
        type: Sequelize.INTEGER,
        references: {
            model: 'tipo_medicamentos',
            key: 'id'
        }
      },
      id_presentacion: {
        type: Sequelize.INTEGER,
        references: {
            model: 'presentaciones',
            key: 'id'
        }
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('medicamentos');
  }
};
