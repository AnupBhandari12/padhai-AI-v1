import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { setSession, verifyPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = await db.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    await setSession(user.id);
    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, exam: user.exam } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to login.' }, { status: 500 });
  }
}
