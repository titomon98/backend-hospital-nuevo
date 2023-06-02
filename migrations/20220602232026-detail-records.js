'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('detail_records', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      contenido_digestivo: {
        type: Sequelize.TEXT,
      },
      estado_digestivo: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_respiratorio: {
        type: Sequelize.TEXT,
      },
      estado_respiratorio: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_cardiovascular: {
        type: Sequelize.TEXT,
      },
      estado_cardiovascular: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_urinario: {
        type: Sequelize.TEXT,
      },
      estado_urinario: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_femenino: {
        type: Sequelize.TEXT,
      },
      estado_femenino: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_endocrino: {
        type: Sequelize.TEXT,
      },
      estado_endocrino: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_osteo: {
        type: Sequelize.TEXT,
      },
      estado_osteo: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_nervioso: {
        type: Sequelize.TEXT,
      },
      estado_nervioso: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_sensorial: {
        type: Sequelize.TEXT,
      },
      estado_sensorial: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_piel: {
        type: Sequelize.TEXT,
      },
      estado_piel: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_habitus: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado_habitus: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_cabeza: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado_cabeza: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_faringe: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado_faringe: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_cuello: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado_cuello: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_torax: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado_torax: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_precordial: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado_precordial: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_glandulas: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado_glandulas: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_abdomen: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado_abdomen: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_genitales: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado_genitales: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_extremidades: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado_extremidades: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_columna: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado_columna: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      contenido_neurologica: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado_neurologica: {
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
      id_paciente: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'pacientes',
            key: 'id'
        }
      },
      id_usuario: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
            model: 'usuarios',
            key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('detail_records');
  }
};
