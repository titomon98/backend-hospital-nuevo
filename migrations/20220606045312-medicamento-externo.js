'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medicamento_externos', {
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
    await queryInterface.dropTable('medicamento_externos');
  }
};
