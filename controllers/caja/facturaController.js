'use strict'
const db = require("../../models");
const Facturas = db.facturas;

const mayus = (v) => String(v ?? '').trim().toUpperCase();
const ACTIVA = 1, CANCELADA = 0;

// Cuenta de la factura: hospital o laboratorio (el front manda 0 en la que no aplica).
// Las facturas viejas guardan NULL en vez de 0, por eso se filtra solo por la que aplica.
function cuentaDe(q) {
    const hospital = parseInt(q.id_cuenta_hospital) || 0;
    const laboratorio = parseInt(q.id_cuenta_laboratorio ?? q.id_cuenta_laboratoio) || 0;
    if (hospital) return { id_cuenta_hospital: hospital };
    if (laboratorio) return { id_cuenta_laboratorio: laboratorio };
    return null;
}

function faltantes(form) {
    const f = [];
    if (!mayus(form.numero)) f.push('número');
    if (!mayus(form.nombre)) f.push('nombre');
    if (!mayus(form.nit)) f.push('NIT');
    return f;
}

const error = (res, e, status = 400, msg = 'Ha ocurrido un error, por favor intente más tarde') => {
    if (e) console.log(e);
    return res.status(status).json({ msg });
};

module.exports = {
    async create(req, res) {
        const form = req.body;
        const cuenta = cuentaDe(form);
        if (!cuenta) return error(res, null, 400, 'Falta la cuenta de la factura');
        const falta = faltantes(form);
        if (falta.length) return error(res, null, 400, `Ingrese ${falta.join(', ')} de la factura`);
        try {
            if (await Facturas.findOne({ where: { ...cuenta, estado: ACTIVA }, attributes: ['id'] })) {
                return error(res, null, 409, 'Esta cuenta ya tiene una factura vigente');
            }
            const nuevaFecha = new Date();
            nuevaFecha.setHours(nuevaFecha.getHours() - 6);
            const factura = await Facturas.create({
                nit: mayus(form.nit),
                nombre: mayus(form.nombre),
                id_cuenta_hospital: form.id_cuenta_hospital,
                id_cuenta_laboratorio: form.id_cuenta_laboratoio,
                total: form.total,
                imagen: Array.isArray(form.imagen) ? form.imagen[0] : form.imagen,
                estado: ACTIVA,
                fecha: nuevaFecha,
                // id_usuario guarda el expediente (FK_facturas_expedientes).
                id_usuario: form.id_usuario,
                numero: mayus(form.numero),
                referencia_factura: form.referencia_factura,
                created_by: req.user?.user ?? req.body.user,
            });
            return res.send({ id: factura.id });
        } catch (e) {
            return error(res, e);
        }
    },

    // Solo la factura vigente de la cuenta (las canceladas no se tocan).
    async update(req, res) {
        const form = req.body;
        const cuenta = cuentaDe(form);
        if (!cuenta) return error(res, null, 400, 'Falta la cuenta de la factura');
        const falta = faltantes(form);
        if (falta.length) return error(res, null, 400, `Ingrese ${falta.join(', ')} de la factura`);
        const imagen = Array.isArray(form.imagen) ? form.imagen[0] : form.imagen;
        try {
            const [n] = await Facturas.update({
                nit: mayus(form.nit),
                nombre: mayus(form.nombre),
                numero: mayus(form.numero),
                referencia_factura: form.referencia_factura,
                ...(imagen ? { imagen } : {}),
                updated_by: req.user?.user ?? req.body.user,
            }, { where: { ...cuenta, estado: ACTIVA } });
            if (!n) return error(res, null, 404, 'La cuenta no tiene una factura vigente');
            return res.send({ ok: true });
        } catch (e) {
            return error(res, e);
        }
    },

    async deactivate(req, res) {
        const cuenta = cuentaDe(req.body);
        if (!cuenta) return error(res, null, 400, 'Falta la cuenta de la factura');
        try {
            const [n] = await Facturas.update(
                { estado: CANCELADA, updated_by: req.user?.user ?? req.body.user },
                { where: { ...cuenta, estado: ACTIVA } }
            );
            if (!n) return error(res, null, 404, 'La cuenta no tiene una factura vigente');
            return res.send({ ok: true });
        } catch (e) {
            return error(res, e);
        }
    },

    // Sin la imagen (base64): la lista solo sirve para saber que cuenta tiene factura.
    async getList(req, res) {
        try {
            return res.send(await Facturas.findAll({ attributes: { exclude: ['imagen'] } }));
        } catch (e) {
            return error(res, e);
        }
    },

    // Factura vigente de una cuenta, con imagen. ?id_cuenta_hospital= | ?id_cuenta_laboratorio=
    async get(req, res) {
        const cuenta = cuentaDe(req.query);
        if (!cuenta) return error(res, null, 400, 'Falta la cuenta de la factura');
        try {
            const factura = await Facturas.findOne({ where: { ...cuenta, estado: ACTIVA }, order: [['id', 'DESC']] });
            return res.send(factura);
        } catch (e) {
            return error(res, e);
        }
    },
};
