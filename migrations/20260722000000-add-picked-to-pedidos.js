'use strict';

// Area destino del pedido: 0 = Farmacia, 1 = Quirofano.
// Necesaria para que farmacia sepa a que columna de existencia sumar al surtir.
// Equivalente en SQL crudo:
//   ALTER TABLE pedidos ADD COLUMN picked INT NULL DEFAULT 0;
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('pedidos', 'picked', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('pedidos', 'picked');
  }
};
