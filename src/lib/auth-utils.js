import jwt from 'jsonwebtoken';

export function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { error: 'Acesso negado. Token não fornecido.', status: 401 };
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    return { user: verified };
  } catch (err) {
    return { error: 'Token inválido.', status: 403 };
  }
}

export function isAdmin(user) {
  return user && user.role === 'admin';
}
