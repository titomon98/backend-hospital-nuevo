'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pacientes', {
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
      apellidos: {
        type: Sequelize.STRING,
        allowNull: false
      },
      apellido_casada: {
        type: Sequelize.STRING,
      },
      sexo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nacimiento: {
        type: Sequelize.DATEONLY,
      },
      edad: {
        type: Sequelize.STRING,
      },
      direccion: {
        type: Sequelize.STRING,
      },
      estado_civil: {
        type: Sequelize.STRING,
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: false
      },
      correo: {
        type: Sequelize.STRING,
      },
      num_expediente: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cui: {
        type: Sequelize.STRING,
      },
      cui_encargado: {
        type: Sequelize.STRING,
      },
      nombre_encargado: {
        type: Sequelize.STRING,
      },
      referente: {
        type: Sequelize.STRING,
      },
      procedencia: {
        type: Sequelize.STRING,
      },
      estado: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      estado_express: {
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
      id_idioma: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
            model: 'idiomas',
            key: 'id'
        }
      },
      id_nacionalidad: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
            model: 'nacionalidades',
            key: 'id'
        }
      },
      id_tipo_sangre: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
            model: 'tipo_sangres',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pacientes');
  }
};
