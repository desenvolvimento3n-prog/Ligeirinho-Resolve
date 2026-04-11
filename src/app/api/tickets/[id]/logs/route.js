import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const logs = await prisma.ticketLog.findMany({
      where: { ticketId: parseInt(id) },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar histórico.' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const auth = verifyAuth(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const ticketId = parseInt(id);
  const userId = auth.user.id;

  try {
    const formData = await req.formData();
    const message = formData.get('message');
    const type = formData.get('type') || 'comment';
    const status = formData.get('status');
    const photo = formData.get('photo');

    let photoUrl = null;

    if (photo && photo.size > 0 && typeof photo !== 'string') {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `ticket-${Date.now()}-${Math.round(Math.random() * 1e9)}${photo.name.substring(photo.name.lastIndexOf('.'))}`;
      
      // Local storage attempt (won't work on Vercel production)
      if (!process.env.VERCEL) {
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        try {
          await mkdir(uploadDir, { recursive: true });
          await writeFile(join(uploadDir, filename), buffer);
          photoUrl = `/uploads/${filename}`;
        } catch (fsError) {
          console.error('Local file save failed:', fsError);
        }
      } else {
        console.warn('File upload attempted on Vercel. Local filesystem is read-only. Photo was NOT saved.');
      }
    }

    // Create Log
    const log = await prisma.ticketLog.create({
      data: {
        message: message?.toString() || '',
        type: type?.toString(),
        photoUrl,
        ticketId,
        userId
      }
    });

    // If status is provided, update ticket status
    if (status) {
      const statusValue = status.toString();
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { 
          status: statusValue,
          finalizerId: statusValue === 'closed' ? userId : undefined
        }
      });
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao registrar no histórico.' }, { status: 500 });
  }
}
