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

  try {
    const { id } = params;
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return NextResponse.json({ error: 'ID de chamado inválido.' }, { status: 400 });
    }

    // Primeiro deletar logs para garantir que não haja erro de chave estrangeira
    await prisma.ticketLog.deleteMany({
      where: {
        ticketId: ticketId
      }
    });
    
    // Agora deletar o chamado
    const deleted = await prisma.ticket.delete({
      where: {
        id: ticketId
      }
    });

    return NextResponse.json({ message: 'Chamado deletado com sucesso.', id: deleted.id });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Erro ao deletar chamado: ' + error.message }, { status: 500 });
  }
}
