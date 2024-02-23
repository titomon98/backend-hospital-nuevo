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
      genero: {
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
      cui_encargado: {
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
      estado_civil: {
        type: Sequelize.STRING
      },
      profesion: {
        type: Sequelize.STRING
      },
      nombre_padre: {
        type: Sequelize.STRING
      },
      nombre_madre: {
        type: Sequelize.STRING
      },
      lugar_nacimiento: {
        type: Sequelize.STRING
      },
      estado_civil_encargado: {
        type: Sequelize.STRING
      },
      profesion_encargado: {
        type: Sequelize.STRING
      },
      direccion_encargado: {
        type: Sequelize.STRING
      },
      nombre_conyuge: {
        type: Sequelize.STRING
      },
      direccion_conyuge: {
        type: Sequelize.STRING
      },
      telefono_conyuge: {
        type: Sequelize.STRING
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('expedientes');
  }
};
