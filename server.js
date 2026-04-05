const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes placeholders
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));

// Catch-all middleware para 404s da API e Fallback do Front-end (SPA)
app.use((req, res, next) => {
  // Se for uma rota de API que chegou aqui, é porque não foi encontrada em routes/
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: `Rota API não encontrada: ${req.method} ${req.originalUrl}` });
  }
  // Para qualquer outra rota (front-end), serve o index.html
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado no servidor!' });
});

// No Vercel, o Vercel chamará o app exportado. No local, rodamos o listen.
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;

server.on('error', (err) => {
  console.error('SERVER ERROR EVENT:', err);
});

// Diagnostic listeners - removidos os que não fazem sentido em serverless ou adaptados
process.on('uncaughtException', (err) => {
  console.error('EXCEÇÃO NÃO TRATADA:', err);
});
