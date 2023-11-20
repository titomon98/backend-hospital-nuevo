'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('expedientes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      expediente: {
        type: Sequelize.STRING,
        allowNull: false
      },
      primer_ingreso: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      nombres: {
        type: Sequelize.STRING,
        allowNull: false
      },
      apellidos: {
        type: Sequelize.STRING,
        allowNull: false
      },
      casada: {
        type: Sequelize.STRING,
      },
      nacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      cui: {
        type: Sequelize.STRING,
      },
      nacionalidad: {
        type: Sequelize.STRING,
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: false
      },
      direccion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nombre_encargado: {
        type: Sequelize.STRING,
        allowNull: false
      },
      contacto_encargado: {
        type: Sequelize.STRING,
        allowNull: false
      },
      parentesco_encargado: {
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
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('expedientes');
  }
};
