import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth, isAdmin } from '@/lib/auth-utils';

export async function PUT(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isAdmin(auth.user)) return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });

  const { id } = params;
  try {
    const { name } = await req.json();
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isAdmin(auth.user)) return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });

  const { id } = params;
  try {
    await prisma.category.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json({ message: 'Categoria excluída' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Erro ao excluir (verifique se há planos/subcategorias vinculados)' }, { status: 400 });
  }
}
