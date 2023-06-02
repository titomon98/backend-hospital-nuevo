'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING,
      },
      apellidos: {
        type: Sequelize.STRING,
      },
      telefono: {
        type: Sequelize.STRING,
      },
      correo: {
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
      id_tipo_usuario: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'tipo_usuarios',
            key: 'id'
        }
      },
    });
    await queryInterface.bulkInsert('usuarios', [{
      user: 'HugoGalvez',
      password: '$2a$10$2NOuyqoq/FiNsw4veVo7iuyQ71oCKVigaN653Ijwho/AYO.zKt4DS',
      nombre: 'Hugo',
      apellidos: 'Galvez',
      telefono: '5000000',
      correo: null,
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
    },
    {
      user: 'AllanLopez',
      password: '$2a$10$2NOuyqoq/FiNsw4veVo7iuyQ71oCKVigaN653Ijwho/AYO.zKt4DS',
      nombre: 'Allan',
      apellidos: 'Lopez',
      telefono: '5000000',
      correo: null,
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
    },
    {
      user: 'RocioGonzalez',
      password: '$2a$10$2NOuyqoq/FiNsw4veVo7iuyQ71oCKVigaN653Ijwho/AYO.zKt4DS',
      nombre: 'Rocio',
      apellidos: 'Gonzalez',
      telefono: '5000000',
      correo: null,
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
    },]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('usuarios');
  }
};
