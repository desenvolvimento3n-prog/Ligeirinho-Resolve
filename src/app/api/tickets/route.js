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
    if (status) where.status = status;
    if (clientId) where.clientId = parseInt(clientId);
    if (userId) where.userId = parseInt(userId);
    if (finalizerId) where.finalizerId = parseInt(finalizerId);
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (subCategoryId) where.subCategoryId = parseInt(subCategoryId);

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

    if (page && limit) {
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
    return NextResponse.json({ error: 'Erro ao buscar chamados.' }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { title, description, clientId, categoryId, subCategoryId } = await req.json();
    const userId = auth.user.id;

    if (!clientId) return NextResponse.json({ error: 'O chamado deve ser vinculado a um cliente.' }, { status: 400 });

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        clientId: parseInt(clientId),
        userId,
        categoryId: categoryId && !isNaN(parseInt(categoryId)) ? parseInt(categoryId) : null,
        subCategoryId: subCategoryId && !isNaN(parseInt(subCategoryId)) ? parseInt(subCategoryId) : null,
        status: 'open'
      }
    });
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Erro ao criar chamado.' }, { status: 500 });
  }
}
