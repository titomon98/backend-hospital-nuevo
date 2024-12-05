'use strict';

const Sequelize = require('sequelize');
const db = require('../../models');
const Asueto = db.asuetos; // Importa el modelo de asuetos

module.exports = {
  async ingresosFechas (req, res) {
    try {
      const asuetos = await Asueto.findAll();
      res.json(asuetos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener asuetos' });
    }
  },

  async ingresosDia (req, res) {
    try {
      const asuetos = await Asueto.findAll();
      res.json(asuetos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener asuetos' });
    }
  },

  async simpleMedioDePago (req, res) {
    try {
      const asuetos = await Asueto.findAll();
      res.json(asuetos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener asuetos' });
    }
  },
};