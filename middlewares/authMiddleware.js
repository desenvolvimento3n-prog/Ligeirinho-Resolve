const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

  try {
    if (!process.env.JWT_SECRET) {
      console.error('ERRO CRÍTICO: JWT_SECRET não definido no servidor!');
      return res.status(500).json({ error: 'Erro de configuração do servidor.' });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error('JWT ERROR:', err.message);
    res.status(403).json({ error: 'Token inválido.' });
  }
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }
}

module.exports = { authenticateToken, isAdmin };
