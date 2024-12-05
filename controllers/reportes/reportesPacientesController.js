'use strict';

const Sequelize = require('sequelize');
const db = require('../../models');
const Expediente = db.expedientes;

module.exports = {
  async list (req, res) {
    try {
      const asuetos = await Asueto.findAll();
      res.json(asuetos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener asuetos' });
    }
  },
};