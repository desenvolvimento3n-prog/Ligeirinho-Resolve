import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

export async function PUT(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const { name, email, phone, document } = await req.json();
    const updated = await prisma.client.update({
      where: { id: parseInt(id) },
      data: { name, email, phone, document }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar cliente.' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    await prisma.client.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Deletado com sucesso.' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar.' }, { status: 500 });
  }
}
