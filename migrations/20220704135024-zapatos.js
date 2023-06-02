'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('zapatos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      estilo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      caracteristicas: {
        type: Sequelize.STRING,
        allowNull: false
      },
      precio_costo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      precio_venta: {
        type: Sequelize.STRING,
        allowNull: false
      },
      precio_minimo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      precio_mayorista: {
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
      id_color: {
        type: Sequelize.INTEGER,
        references: {
            model: 'colores',
            key: 'id'
        }
      },
      id_marca: {
        type: Sequelize.INTEGER,
        references: {
            model: 'marcas',
            key: 'id'
        }
      },
      id_clasificacion: {
        type: Sequelize.INTEGER,
        references: {
            model: 'clasificaciones',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('zapatos');
  }
};
