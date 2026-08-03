'use strict'
const db = require('../../models');
const Revision = db.revision_consumos;

// Revisión de los consumos de una cuenta (medicamentos, anestésicos, quirúrgico y
// común). Estado: 1 = comprobado, 2 = inconsistencia reportada. Una revisión por
// cuenta (se actualiza si ya existía). Solo la usan roles 1, 3, 9 y 11 (validado
// también en el front).
module.exports = {
    async set(req, res) {
        const { id_cuenta, estado } = req.body;
        const usuario = (req.user && req.user.user) ? req.user.user : (req.body.user || null);
        if (!id_cuenta || ![1, 2].includes(parseInt(estado))) {
            return res.status(400).json({ msg: 'Datos de revisión inválidos' });
        }
        try {
            const [row] = await Revision.findOrCreate({
                where: { id_cuenta: id_cuenta },
                defaults: { id_cuenta: id_cuenta, estado: parseInt(estado), reviewed_by: usuario }
            });
            await row.update({ estado: parseInt(estado), reviewed_by: usuario });
            return res.json({ id_cuenta: id_cuenta, estado: row.estado, reviewed_by: row.reviewed_by });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },
    async get(req, res) {
        const id_cuenta = req.params.id_cuenta;
        try {
            const row = await Revision.findOne({ where: { id_cuenta: id_cuenta } });
            if (!row) {
                return res.json({ id_cuenta: id_cuenta, estado: 0, reviewed_by: null });
            }
            return res.json({ id_cuenta: id_cuenta, estado: row.estado, reviewed_by: row.reviewed_by });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    }
};
