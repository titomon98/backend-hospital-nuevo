'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('compras', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      fecha_recibir: {
        type: Sequelize.DATEONLY,
      },
      total: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      razon_social: {
        type: Sequelize.STRING,
      },
      actividad_recreativa: {
        type: Sequelize.STRING,
      },
      factura: {
        type: Sequelize.STRING,
      },
      referencia_factura: {
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
      id_proveedor: {
        type: Sequelize.INTEGER,
        references: {
            model: 'proveedores',
            key: 'id'
        }
      },
      id_partida: {
        type: Sequelize.INTEGER,
        references: {
            model: 'partidas',
            key: 'id'
        }
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        references: {
            model: 'usuarios',
            key: 'id'
        }
      },
      id_contribuyente: {
        type: Sequelize.INTEGER,
        references: {
            model: 'contribuyentes',
            key: 'id'
        }
      },
      id_destino: {
        type: Sequelize.INTEGER,
        references: {
            model: 'destinos',
            key: 'id'
        }
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('compras');
  }
};
