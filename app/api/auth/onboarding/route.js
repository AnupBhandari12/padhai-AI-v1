import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  await db.user.update({ where: { id: user.id }, data: { exam: String(body.exam || 'CEE'), subjects: body.subjects || [], goal: String(body.goal || ''), dailyMinutes: Number(body.dailyMinutes || 60) } });
  return NextResponse.json({ ok: true });
}
