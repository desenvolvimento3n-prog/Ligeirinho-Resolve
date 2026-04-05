const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticateToken } = require('../middlewares/authMiddleware');

const multer = require('multer');
const path = require('path');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ticket-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.use(authenticateToken); // Proteger todas as rotas de tickets

// Get Ticket Logs (History)
router.get('/:id/logs', async (req, res) => {
  try {
    const logs = await prisma.ticketLog.findMany({
      where: { ticketId: parseInt(req.params.id) },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico.' });
  }
});

// Add Ticket Log (Comment/Status/Photo)
router.post('/:id/logs', upload.single('photo'), async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { message, type, status } = req.body;
    const userId = req.user.id;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Create Log
    const log = await prisma.ticketLog.create({
      data: {
        message,
        type: type || 'comment',
        photoUrl,
        ticketId,
        userId
      }
    });

    // If status is provided, update ticket status
    if (status) {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { 
          status,
          finalizerId: status === 'closed' ? userId : undefined
        }
      });
    }

    res.status(201).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar no histórico.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, clientId, userId, startDate, endDate, finalizerId, categoryId, subCategoryId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (clientId) where.clientId = parseInt(clientId);
    if (userId) where.userId = parseInt(userId);
    if (finalizerId) where.finalizerId = parseInt(finalizerId);
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (subCategoryId) where.subCategoryId = parseInt(subCategoryId);

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(`${startDate}T00:00:00`);
      if (endDate) where.createdAt.lte = new Date(`${endDate}T23:59:59.999`);
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        user: { select: { id: true, name: true } },
        category: true,
        subcategory: true,
        finalizer: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Erro ao buscar chamados.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { client: true, user: true, category: true, subcategory: true, finalizer: true }
    });
    if (!ticket) return res.status(404).json({ error: 'Chamado não encontrado.' });
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, clientId, categoryId, subCategoryId } = req.body;
    const userId = req.user.id; // Pegando do token JWT

    if (!clientId) return res.status(400).json({ error: 'O chamado deve ser vinculado a um cliente.' });

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        clientId: parseInt(clientId),
        userId,
        categoryId: categoryId ? parseInt(categoryId) : null,
        subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
        status: 'open'
      }
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Erro ao criar chamado.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, categoryId, subCategoryId } = req.body;
    const updated = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: { 
        title, 
        description, 
        status,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        subCategoryId: subCategoryId ? parseInt(subCategoryId) : undefined,
        finalizerId: status === 'closed' ? req.user.id : undefined
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar chamado.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ticket.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Chamado deletado.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar chamado.' });
  }
});

module.exports = router;
