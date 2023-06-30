'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medicos', {
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
      nit: {
          type: Sequelize.STRING,
        },
        telefono: {
          type: Sequelize.STRING,
          allowNull: false
        },
        correo: {
          type: Sequelize.STRING,
        },
        observaciones: {
          type: Sequelize.TEXT,
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
      id_especialidad: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'especialidades',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('medicos');
  }
};
