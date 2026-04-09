import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/db';
import { verifyAuth, isAdmin } from '@/lib/auth-utils';

export async function GET(req) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isAdmin(auth.user)) return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, username: true, role: true, createdAt: true }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar usuários.' }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isAdmin(auth.user)) return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });

  try {
    const { name, username, password, role } = await req.json();
    if (!password) return NextResponse.json({ error: 'Senha é obrigatória para novos usuários.' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'A senha deve ter no mínimo 6 caracteres.' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, username, role, password: hashedPassword },
      select: { id: true, name: true, username: true, role: true }
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Nome de usuário já existe.' }, { status: 400 });
    return NextResponse.json({ error: 'Erro ao criar usuário.' }, { status: 500 });
  }
}
