import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = params;
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
      include: { client: true, user: true, category: true, subcategory: true, finalizer: true }
    });
    if (!ticket) return NextResponse.json({ error: 'Chamado não encontrado.' }, { status: 404 });
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json({ error: 'Erro interno: ' + error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = params;
  try {
    const { title, description, status, categoryId, subCategoryId } = await req.json();
    const updated = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: { 
        title, 
        description, 
        status,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        subCategoryId: subCategoryId ? parseInt(subCategoryId) : undefined,
        finalizerId: status === 'closed' ? auth.user.id : undefined
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Erro ao atualizar chamado: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = params;
  try {
    // Primeiro deletar logs se o cascade não estiver funcionando no DB
    await prisma.ticketLog.deleteMany({ where: { ticketId: parseInt(id) } });
    
    await prisma.ticket.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Chamado deletado.' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Erro ao deletar chamado: ' + error.message }, { status: 500 });
  }
}
