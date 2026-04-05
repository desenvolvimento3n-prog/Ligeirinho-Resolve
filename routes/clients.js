const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken); // Proteger rotas com JWT

router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, document } = req.body;
    const client = await prisma.client.create({ data: { name, email, phone, document } });
    res.status(201).json(client);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Email ou documento já cadastrado.' });
    res.status(500).json({ error: 'Erro ao criar cliente.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, document } = req.body;
    const updated = await prisma.client.update({
      where: { id: parseInt(id) },
      data: { name, email, phone, document }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Deletado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar.' });
  }
});

module.exports = router;
