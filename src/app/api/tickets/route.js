import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(req) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const userId = searchParams.get('userId');
    const finalizerId = searchParams.get('finalizerId');
    const categoryId = searchParams.get('categoryId');
    const subCategoryId = searchParams.get('subCategoryId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where = {};
    if (status && status !== 'todos') where.status = status;
    if (clientId && !isNaN(parseInt(clientId))) where.clientId = parseInt(clientId);
    if (userId && !isNaN(parseInt(userId))) where.userId = parseInt(userId);
    if (finalizerId && !isNaN(parseInt(finalizerId))) where.finalizerId = parseInt(finalizerId);
    if (categoryId && !isNaN(parseInt(categoryId))) where.categoryId = parseInt(categoryId);
    if (subCategoryId && !isNaN(parseInt(subCategoryId))) where.subCategoryId = parseInt(subCategoryId);

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(`${startDate}T00:00:00`);
      if (endDate) where.createdAt.lte = new Date(`${endDate}T23:59:59.999`);
    }

    const page = searchParams.get('page') ? parseInt(searchParams.get('page')) : null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : null;

    const findOptions = {
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        user: { select: { id: true, name: true } },
        category: true,
        subcategory: true,
        finalizer: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    };

    if (page && limit && !isNaN(page) && !isNaN(limit)) {
      findOptions.skip = (page - 1) * limit;
      findOptions.take = limit;
      
      const [tickets, totalCount] = await Promise.all([
        prisma.ticket.findMany(findOptions),
        prisma.ticket.count({ where })
      ]);
      
      return NextResponse.json({ tickets, totalCount });
    } else {
      const tickets = await prisma.ticket.findMany(findOptions);
      return NextResponse.json(tickets);
    }
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Erro ao buscar chamados no servidor.' }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { title, description, clientId, categoryId, subCategoryId } = await req.json();
    
    // Convert to integer and validate
    const parsedUserId = parseInt(auth.user.id);
    const parsedClientId = parseInt(clientId);

    if (isNaN(parsedUserId)) return NextResponse.json({ error: 'Usuário inválido na sessão.' }, { status: 400 });
    if (!title || title.trim() === '') return NextResponse.json({ error: 'O título do chamado é obrigatório.' }, { status: 400 });
    if (!parsedClientId || isNaN(parsedClientId)) return NextResponse.json({ error: 'O chamado deve ser vinculado a um cliente válido.' }, { status: 400 });

    const ticket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        description: description || '',
        clientId: parsedClientId,
        userId: parsedUserId,
        categoryId: categoryId && !isNaN(parseInt(categoryId)) ? parseInt(categoryId) : null,
        subCategoryId: subCategoryId && !isNaN(parseInt(subCategoryId)) ? parseInt(subCategoryId) : null,
        status: 'open'
      }
    });
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Erro interno ao criar chamado: ' + error.message }, { status: 500 });
  }
}
