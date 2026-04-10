import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { verifyAuth, isAdmin } from '@/lib/auth-utils';

export async function PUT(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isAdmin(auth.user)) return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });

  const { id } = params;
  try {
    const { name, username, role, password } = await req.json();
    
    if (password && password.length < 6) {
      return NextResponse.json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' }, { status: 400 });
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
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar usuário.' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isAdmin(auth.user)) return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });

  const { id } = params;
  try {
    if (parseInt(id) === auth.user.id) {
      return NextResponse.json({ error: 'Você não pode excluir seu próprio usuário.' }, { status: 400 });
    }
    await prisma.user.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Usuário excluído.' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir usuário.' }, { status: 500 });
  }
}
