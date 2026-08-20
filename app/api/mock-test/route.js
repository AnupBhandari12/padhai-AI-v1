import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { fallbackQuestions } from '@/lib/questions';
import { retrieveContext, buildContext } from '@/lib/rag';
import { generateQuestions } from '@/lib/ai';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const attempts = await db.attempt.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 10 });
  return NextResponse.json({ attempts });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const type = body.type || 'mock-test';
    let questions = Array.isArray(body.questions) ? body.questions : [];
    const topic = String(body.topic || user.exam || 'General');

    if (!questions.length) {
      const chunks = await retrieveContext(user.id, topic, 10);
      const context = buildContext(chunks);
      questions = await generateQuestions({ exam: user.exam, topic, count: 10, context, mode: 'mock' });
      if (!questions.length) questions = fallbackQuestions.map((q) => ({ ...q, topic }));
      if (body.generateOnly) return NextResponse.json({ questions, sources: chunks.map(c=>({id:c.id,title:c.document.title,fileName:c.document.fileName,content:c.content})) });
    }

    const answers = Array.isArray(body.answers) ? body.answers : [];

    const enrichedAnswers = questions.map((q, i) => ({
      topic: q.topic || topic,
      selected: Number.isInteger(answers[i]) ? answers[i] : -1,
      correctAnswer: q.answer,
      isCorrect: answers[i] === q.answer,
    }));
    const score = enrichedAnswers.reduce((sum, item) => sum + (item.isCorrect ? 1 : 0), 0);
    const attempt = await db.attempt.create({ data: { userId: user.id, type, score, total: questions.length, topic, answers: enrichedAnswers } });
    return NextResponse.json({ score, total: questions.length, attemptId: attempt.id, questions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Could not process test.' }, { status: 500 });
  }
}
