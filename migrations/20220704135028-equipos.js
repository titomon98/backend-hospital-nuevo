'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('socios', {
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
      cantidad_usos: {
        type: Sequelize.STRING,
        allowNull: false
      },
      precio_publico: {
        type: Sequelize.STRING,
        allowNull: false
      },
      gasto_unico: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fecha_adquisicion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      existencia: {
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
      id_medico: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'medicos',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('socios');
  }
};
