'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('detalle_permisos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      id_permiso: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'permisos',
            key: 'id'
        }
      },
    });
    await queryInterface.bulkInsert('detalle_permisos', [{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 1,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 2,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 3,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 4,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 5,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 6,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 7,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 8,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 9,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 10,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 11,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 12,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 13,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 14,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 15,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 16,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 17,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 18,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 19,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 20,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 21,
    },{
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_tipo_usuario: 1,
      id_permiso: 22,
    },]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('detalle_permisos');
  }
};
