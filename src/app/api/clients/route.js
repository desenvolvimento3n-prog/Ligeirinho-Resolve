import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(req) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar clientes.' }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { name, email, phone, document } = await req.json();
    const client = await prisma.client.create({ data: { name, email, phone, document } });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Email ou documento já cadastrado.' }, { status: 400 });
    return NextResponse.json({ error: 'Erro ao criar cliente.' }, { status: 500 });
  }
}
