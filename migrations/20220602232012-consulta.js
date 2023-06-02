'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('consultas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      start: {
        type: Sequelize.STRING,
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      hora_entrada: {
        type: Sequelize.DATE,
        allowNull: true
      },
      referido: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estado: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      estado_consulta: {
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
      id_paciente: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'pacientes',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('consultas');
  }
};