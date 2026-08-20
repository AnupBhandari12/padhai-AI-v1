import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function normalizeTopic(value) {
  return String(value || 'General').trim() || 'General';
}

function addTopic(bucket, topic, score, total) {
  const key = normalizeTopic(topic);
  bucket[key] ||= { topic: key, score: 0, total: 0, attempts: 0 };
  bucket[key].score += Number(score) || 0;
  bucket[key].total += Number(total) || 0;
  bucket[key].attempts += 1;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const attempts = await db.attempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    let score = 0;
    let total = 0;
    const topics = {};

    for (const attempt of attempts) {
      score += attempt.score;
      total += attempt.total;
      const answers = Array.isArray(attempt.answers) ? attempt.answers : [];
      let usedQuestionTopics = false;
      for (const item of answers) {
        if (item && typeof item === 'object' && item.topic) {
          addTopic(topics, item.topic, item.isCorrect ? 1 : 0, 1);
          usedQuestionTopics = true;
        }
      }
      if (!usedQuestionTopics) addTopic(topics, attempt.topic, attempt.score, attempt.total);
    }

    const topicRows = Object.values(topics)
      .map((row) => ({ ...row, accuracy: row.total ? Math.round((row.score / row.total) * 100) : 0 }))
      .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);

    const recent = attempts.slice(-10);
    const recentTotal = recent.reduce((s, a) => s + a.total, 0);
    const recentScore = recent.reduce((s, a) => s + a.score, 0);
    const accuracy = total ? Math.round((score / total) * 100) : 0;
    const recentAccuracy = recentTotal ? Math.round((recentScore / recentTotal) * 100) : 0;
    const progress = total ? Math.min(100, Math.max(8, Math.round(accuracy * 0.75 + Math.min(100, attempts.length * 5) * 0.25))) : 8;

    const weakTopics = topicRows.filter((t) => t.total >= 1 && t.accuracy < 70).slice(0, 5);

    return NextResponse.json({
      summary: { score, total, accuracy, recentAccuracy, attempts: attempts.length, progress },
      topics: topicRows,
      weakTopics,
      recent: attempts.slice(-8).reverse().map((a) => ({ id: a.id, type: a.type, topic: a.topic || 'General', score: a.score, total: a.total, accuracy: a.total ? Math.round((a.score / a.total) * 100) : 0, createdAt: a.createdAt })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Could not load progress.' }, { status: 500 });
  }
}
