import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth, isAdmin } from '@/lib/auth-utils';

export async function POST(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isAdmin(auth.user)) return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });

  const { id } = params; // Mudado de categoryId para id para evitar conflito de slugs no Next.js
  try {
    const { name } = await req.json();
    const sub = await prisma.subcategory.create({
      data: { name, categoryId: parseInt(id) }
    });
    return NextResponse.json(sub, { status: 201 });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json({ error: 'Erro ao criar subcategoria' }, { status: 400 });
  }
}
