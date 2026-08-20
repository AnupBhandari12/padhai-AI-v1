import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const score = (v) => Math.min(5, Math.max(1, Number(v) || 1));

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const feedback = await db.betaFeedback.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ feedback });
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const data = {
      userId: user.id,
      ease: score(body.ease),
      aiTutor: score(body.aiTutor),
      quiz: score(body.quiz),
      mockTest: score(body.mockTest),
      weakTopics: score(body.weakTopics),
      studyPlan: score(body.studyPlan),
      wouldReturn: Boolean(body.wouldReturn),
      wouldPay: Boolean(body.wouldPay),
      priceRange: String(body.priceRange || '').trim() || null,
      bestFeature: String(body.bestFeature || '').trim() || null,
      disliked: String(body.disliked || '').trim() || null,
    };
    const feedback = await db.betaFeedback.upsert({
      where: { userId: user.id },
      update: data,
      create: data,
    });
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Could not save feedback.' }, { status: 500 });
  }
}
