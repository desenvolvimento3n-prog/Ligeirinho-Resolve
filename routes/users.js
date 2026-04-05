const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const prisma = require('../db');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// Get all users
router.get('/', isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, username: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// Create new user
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    if (!password) return res.status(400).json({ error: 'Senha é obrigatória para novos usuários.' });
    if (password.length < 6) return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, username, role, password: hashedPassword },
      select: { id: true, name: true, username: true, role: true }
    });
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Nome de usuário já existe.' });
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

// Update user (name, username, role, password)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, role, password } = req.body;
    
    if (password && password.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }

    const data = { name, username, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: { id: true, name: true, username: true, role: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
});

// Change user password
router.patch('/:id/password', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Senha é obrigatória.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword }
    });
    res.json({ message: 'Senha alterada com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
});

// Delete user
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Don't allow self-deletion
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Você não pode excluir seu próprio usuário.' });
    }
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Usuário excluído.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
});

module.exports = router;
