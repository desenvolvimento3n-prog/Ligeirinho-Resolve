import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/db';
import { verifyAuth, isAdmin } from '@/lib/auth-utils';

export async function PATCH(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isAdmin(auth.user)) return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });

  const { id } = params;
  try {
    const { password } = await req.json();
    if (!password) return NextResponse.json({ error: 'Senha é obrigatória.' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword }
    });
    return NextResponse.json({ message: 'Senha alterada com sucesso.' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao alterar senha.' }, { status: 500 });
  }
}
