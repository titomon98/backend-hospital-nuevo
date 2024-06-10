module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('detalle_honorarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_medico: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'medicos',
          key: 'id'
        }
      },
      id_cuenta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cuentas',
          key: 'id'
        }
      },
      descripcion: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      total: {
        type: Sequelize.DECIMAL(20, 6),
        allowNull: false
      },
      createdAt: { allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
    },
    
    async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('detalle_honorarios');
    }
    };
