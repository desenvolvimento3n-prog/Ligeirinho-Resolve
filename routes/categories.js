const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// --- Categories ---

// List all categories with their subcategories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { subcategories: true },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Create Category (Admin Only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

  try {
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({ error: 'Categoria já existe ou erro no cadastro' });
  }
});

// Update Category (Admin Only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: { name }
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ error: 'Erro ao atualizar categoria' });
  }
});

// Delete Category (Admin Only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Categoria excluída' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(400).json({ error: 'Erro ao excluir (verifique se há planos/subcategorias vinculados)' });
  }
});

// --- Subcategories ---

// Create Subcategory (Admin Only)
router.post('/:categoryId/subcategories', authenticateToken, isAdmin, async (req, res) => {
  const { name } = req.body;
  const categoryId = parseInt(req.params.categoryId);

  try {
    const sub = await prisma.subcategory.create({
      data: { name, categoryId }
    });
    res.status(201).json(sub);
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(400).json({ error: 'Erro ao criar subcategoria' });
  }
});

// Delete Subcategory (Admin Only)
router.delete('/subcategories/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await prisma.subcategory.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Subcategoria excluída' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(400).json({ error: 'Erro ao excluir subcategoria' });
  }
});

module.exports = router;
