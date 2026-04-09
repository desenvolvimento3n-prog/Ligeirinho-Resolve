import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/db';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário ou senha incorretos.' }, { status: 400 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: 'Usuário ou senha incorretos.' }, { status: 400 });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return NextResponse.json({ 
      token, 
      user: { id: user.id, username: user.username, name: user.name, role: user.role } 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao fazer login.' }, { status: 500 });
  }
}
