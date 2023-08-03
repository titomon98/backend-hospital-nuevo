'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('quirurgicos', {
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
      precio_costo: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      precio_venta: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      existencia_minima: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      existencia_actual: {
        type: Sequelize.INTEGER,
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
      id_marca: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'marcas',
            key: 'id'
        }
      },
      id_presentacion: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'presentaciones',
            key: 'id'
        }
      },
      id_proveedor: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'proveedores',
            key: 'id'
        }
      },
      
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('quirurgicos');
  }
};
