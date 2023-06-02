'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('campo_resultados', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      valor_resultado: {
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
      id_resultado: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'resultados',
            key: 'id'
        }
      },
      id_campo_examen: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'campo_examenes',
            key: 'id'
        }
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('campo_resultados');
  }
};
