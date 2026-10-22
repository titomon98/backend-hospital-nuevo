// Recalcula cuentas.total de cuentas puntuales con el mismo calculo de la cuenta
// total (habitacion con corte 2 PM, consumos, servicios, sala y honorarios).
// Sirve despues de corregir a mano una fecha de ingreso/egreso. Correr en el
// servidor del backend:
//
//   node scripts/recalcular_cuentas.js 74 75 77            -> solo muestra
//   node scripts/recalcular_cuentas.js 74 75 77 --aplicar  -> guarda el total nuevo
//
// Lo ya pagado (total - pendiente_de_pago) se respeta: el pendiente nuevo es
// recalculado - pagado, minimo 0. Si lo pagado pasa del total nuevo, lo avisa
// (saldo a favor del paciente) y no lo resuelve.
process.chdir(require('path').join(__dirname, '..'));
require('dotenv').config();
const db = require('../models');
const { itemsDeCuenta } = require('../controllers/caja/consumosController');

const APLICAR = process.argv.includes('--aplicar');
const ids = process.argv.slice(2).filter(a => /^\d+$/.test(a)).map(Number);
const q2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

(async () => {
  if (!ids.length) throw new Error('Indique los id de cuenta: node scripts/recalcular_cuentas.js 74 75');
  const cambios = [];
  for (const id of ids) {
    const c = await db.cuentas.findByPk(id);
    if (!c) { console.log(`cuenta ${id}: no existe`); continue; }
    const total = q2(c.total);
    const pagado = q2(total - (parseFloat(c.pendiente_de_pago) || 0));
    const nuevo = q2((await itemsDeCuenta(id)).reduce((a, i) => a + i.total, 0));
    const pendiente = q2(Math.max(0, nuevo - pagado));
    const aFavor = q2(Math.max(0, pagado - nuevo));
    console.log(`cuenta ${id}: total ${total} -> ${nuevo} (dif ${q2(nuevo - total)}), pagado ${pagado}, pendiente ${c.pendiente_de_pago} -> ${pendiente}` +
      (aFavor > 0 ? `  ** SALDO A FAVOR DEL PACIENTE: Q${aFavor} **` : ''));
    if (Math.abs(nuevo - total) >= 0.01) cambios.push({ id, total, nuevo, pendiente });
  }

  if (!APLICAR) {
    console.log('\nModo consulta: no se cambio nada. Para guardar agregue --aplicar');
  } else if (cambios.length) {
    let n = 0;
    await db.sequelize.transaction(async (t) => {
      for (const x of cambios) {
        const [filas] = await db.cuentas.update(
          { total: x.nuevo, pendiente_de_pago: x.pendiente },
          { where: { id: x.id, total: x.total }, transaction: t } // solo si el total no cambio
        );
        n += filas;
      }
    });
    console.log(`\nAplicado: ${n} cuenta(s) actualizadas.`);
  }
  await db.sequelize.close();
})().catch(async (e) => { console.error(e); await db.sequelize.close(); process.exit(1); });
