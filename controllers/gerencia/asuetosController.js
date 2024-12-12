'use strict';

const Sequelize = require('sequelize');
const db = require('../../models');
const Asueto = db.asuetos; // Importa el modelo de asuetos

module.exports = {
// Obtener todos los asuetos
async list(req, res) {
  try {
    const asuetos = await Asueto.findAll({
      where: {
        estado: 1
      }
    });
    res.json(asuetos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener asuetos' });
  }
},

// Crear un nuevo asueto
async create (req, res){
  const { nombre, fecha } = req.body;
  try {
    const nuevoAsueto = await Asueto.create({ nombre, fecha });
    res.json(nuevoAsueto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear asueto' });
  }
},

//Obtenerte asueto por id
async gitId (req, res) {
    const { id } = req.params;
  
    try {
      const asueto = await Asueto.findByPk(id);
      if (asueto) {
        res.json(asueto);
      } else {
        res.status(400).json({ error: 'Asueto no encontrado' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener asueto' });
    }
  },
// Actualizar un asueto existente
async update(req, res) {
  const { id } = req.params;
  console.log(id)

  try {
    const asuetoActualizado = await Asueto.findByPk(id);
    console.log(asuetoActualizado)

    if (asuetoActualizado) {
      await asuetoActualizado.update({ estado: 0 });
      res.json({ mensaje: 'Estado de asueto actualizado a 0' });
    } else {
      res.status(400).json({ error: 'Asueto no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar estado de asueto' });
  }
},

// Eliminar un asueto
async delete (req, res) {
  const { id } = req.params;
  try {
    const asuetoEliminado = await Asueto.destroy({ where: { id } });
    if (asuetoEliminado) {
      res.json({ mensaje: 'Asueto eliminado' });
    } else {
      res.status(400).json({ error: 'Asueto no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar asueto' });
  }
}
};