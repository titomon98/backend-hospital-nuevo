'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('permisos', {
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
    await queryInterface.bulkInsert('permisos', [{
      nombre: 'Panel de Control',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Asignación de Usuarios',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Compras - Farmacia',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Ventas - Farmacia',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Inventario - Farmacia',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Ajustes de Inventario - Farmacia',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Reportes y Estadísticas - Farmacia',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Cobros',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Cierre de Caja',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Reportes y Estadísticas - Caja',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Pacientes',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Historial de Pacientes',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Reportes y Estadísticas - Pacientes',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Clínicas',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Agenda de Citas - Arrendamiento',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Reportes y Estadísticas - Arrendamiento',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Exámenes',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Compras - Laboratorio',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Ventas - Laboratorio',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Inventario - Laboratorio',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Agenda de Citas - Laboratorio',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      nombre: 'Reportes y Estadísticas - Laboratorio',
      estado: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('permisos');
  }
};
