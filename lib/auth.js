import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from '@/lib/prisma';

const COOKIE_NAME = 'padhai_session';
const SECRET = process.env.AUTH_SECRET || 'change-this-development-secret';

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex');
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function makeSession(userId) {
  const signature = sign(userId);
  return `${userId}.${signature}`;
}

export function verifySession(token) {
  if (!token) return null;
  const [userId, signature] = token.split('.');
  if (!userId || !signature) return null;
  const expected = sign(userId);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return userId;
}

export async function setSession(userId) {
  const store = await cookies();
  store.set(COOKIE_NAME, makeSession(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const store = await cookies();
  const userId = verifySession(store.get(COOKIE_NAME)?.value);
  if (!userId) return null;
  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, exam: true, subjects: true, goal: true, dailyMinutes: true, createdAt: true },
  });
}
