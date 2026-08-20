import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (process.env.ADMIN_EMAIL && user.email?.trim().toLowerCase() !== process.env.ADMIN_EMAIL.trim().toLowerCase()) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const [users, documents, attempts, feedback, quizAttempts, mockAttempts] = await Promise.all([
      db.user.count(), db.document.count(), db.attempt.count(), db.betaFeedback.count(),
      db.attempt.count({ where: { type: 'quiz' } }), db.attempt.count({ where: { type: 'mock-test' } }),
    ]);
    const returnYes = await db.betaFeedback.count({ where: { wouldReturn: true } });
    const payYes = await db.betaFeedback.count({ where: { wouldPay: true } });
    const uploadedUsers = await db.user.count({ where: { documents: { some: {} } } });
    const activeUsers = await db.user.count({ where: { attempts: { some: {} } } });
    const dayAgo = new Date(Date.now() - 24*60*60*1000);
    const recentUsers = await db.user.count({ where: { createdAt: { gte: dayAgo } } });
    const allAttempts = await db.attempt.findMany({ select: { score: true, total: true } });
    const accuracy = allAttempts.length ? Math.round(allAttempts.reduce((s,a)=>s+a.score,0) / Math.max(1, allAttempts.reduce((s,a)=>s+a.total,0)) * 100) : 0;
    const bestFeatures = await db.betaFeedback.findMany({ select: { bestFeature: true, priceRange: true } });
    return NextResponse.json({ users, documents, attempts, feedback, quizAttempts, mockAttempts, returnYes, payYes, uploadedUsers, activeUsers, recentUsers, accuracy, bestFeatures });
  } catch (error) {
    console.error(error); return NextResponse.json({ error: error.message || 'Could not load analytics.' }, { status: 500 });
  }
}
