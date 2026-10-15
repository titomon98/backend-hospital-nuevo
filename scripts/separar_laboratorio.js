// Quita el laboratorio que la version anterior sumaba a cuentas.total al egresar
// (o al pagar una cuenta parcial). Correr en el servidor del backend:
//
//   node scripts/separar_laboratorio.js            -> solo muestra (no cambia nada)
//   node scripts/separar_laboratorio.js --aplicar  -> aplica las correcciones
//
// Por cada cuenta abierta (por cobrar o parcial) con laboratorio abierto, recalcula
// lo que le corresponde al hospital con el mismo calculo de la cuenta total
// (habitacion, consumos, servicios, sala y honorarios). Solo corrige si
//   total guardado - total recalculado == laboratorio abierto
// Si no cuadra exacto, no la toca y la reporta. Una cuenta ya corregida ya no
// cumple la condicion, asi que correrlo dos veces no resta dos veces.
process.chdir(require('path').join(__dirname, '..'));
require('dotenv').config();
const db = require('../models');
const { itemsDeCuenta } = require('../controllers/caja/consumosController');
const Op = db.Sequelize.Op;

const APLICAR = process.argv.includes('--aplicar');
const q2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

(async () => {
  const cuentas = await db.cuentas.findAll({
    where: {
      [Op.or]: [{ estado: 1, fecha_egreso: { [Op.ne]: null } }, { estado: 10 }],
    },
    include: [{ model: db.expedientes, attributes: ['expediente', 'nombres', 'apellidos'] }],
    order: [['id', 'ASC']],
  });

  const corregir = [];
  const revisar = [];
  for (const c of cuentas) {
    if ((parseFloat(c.pagado_laboratorio) || 0) > 0) {
      revisar.push({ c, motivo: 'tiene laboratorio cobrado en la caja del hospital (cobro anterior)' });
      continue;
    }
    const labs = await db.lab_cuentas.findAll({ where: { id_expediente: c.id_expediente, estado: 1 }, attributes: ['id'] });
    const lab = q2(labs.length ? await db.examenes_realizados.sum('total', { where: { id_cuenta: labs.map(l => l.id) } }) : 0);
    if (lab <= 0) continue;

    const recalculado = q2((await itemsDeCuenta(c.id)).reduce((a, i) => a + i.total, 0));
    const total = q2(c.total);
    const diferencia = q2(total - recalculado);
    if (Math.abs(diferencia - lab) < 0.01) {
      corregir.push({ c, total, lab, nuevo: q2(total - lab), recalculado });
    } else if (Math.abs(diferencia) >= 0.01) {
      revisar.push({ c, motivo: `total ${total} - recalculado ${recalculado} = ${diferencia}; laboratorio abierto ${lab}` });
    }
  }

  const nombre = (c) => `${c.expediente ? c.expediente.expediente : ''} ${c.expediente ? `${c.expediente.nombres} ${c.expediente.apellidos}` : ''}`.trim();
  console.log(`\nCuentas a corregir (${corregir.length}):`);
  for (const x of corregir) {
    console.log(`  cuenta ${x.c.id} ${nombre(x.c)}: total ${x.total} -> ${x.nuevo} (quita laboratorio ${x.lab})`);
  }
  console.log(`\nCuentas para revisar a mano (${revisar.length}):`);
  for (const x of revisar) console.log(`  cuenta ${x.c.id} ${nombre(x.c)}: ${x.motivo}`);

  if (!APLICAR) {
    console.log('\nModo consulta: no se cambio nada. Para aplicar: node scripts/separar_laboratorio.js --aplicar');
  } else if (corregir.length) {
    let n = 0;
    await db.sequelize.transaction(async (t) => {
      for (const x of corregir) {
        const [filas] = await db.cuentas.update(
          {
            total: x.nuevo,
            pendiente_de_pago: q2(Math.max(0, (parseFloat(x.c.pendiente_de_pago) || 0) - x.lab)),
          },
          { where: { id: x.c.id, total: x.total }, transaction: t } // solo si el total no cambio
        );
        n += filas;
      }
    });
    console.log(`\nAplicado: ${n} cuenta(s) corregidas.`);
  }
  await db.sequelize.close();
})().catch(async (e) => { console.error(e); await db.sequelize.close(); process.exit(1); });
