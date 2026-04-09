import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth, isAdmin } from '@/lib/auth-utils';

export async function DELETE(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isAdmin(auth.user)) return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });

  const { id } = params;
  try {
    await prisma.subcategory.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json({ message: 'Subcategoria excluída' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json({ error: 'Erro ao excluir subcategoria' }, { status: 400 });
  }
}
