import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function normalizeTopic(value) {
  return String(value || 'General').trim() || 'General';
}

function buildTopics(attempts) {
  const topics = {};

  for (const attempt of attempts) {
    const answers = Array.isArray(attempt.answers) ? attempt.answers : [];
    let usedQuestionTopics = false;

    for (const item of answers) {
      if (item && typeof item === 'object' && item.topic) {
        const topic = normalizeTopic(item.topic);
        topics[topic] ||= { topic, score: 0, total: 0 };
        topics[topic].score += item.isCorrect ? 1 : 0;
        topics[topic].total += 1;
        usedQuestionTopics = true;
      }
    }

    if (!usedQuestionTopics) {
      const topic = normalizeTopic(attempt.topic);
      topics[topic] ||= { topic, score: 0, total: 0 };
      topics[topic].score += Number(attempt.score) || 0;
      topics[topic].total += Number(attempt.total) || 0;
    }
  }

  return Object.values(topics)
    .map((item) => ({
      ...item,
      accuracy: item.total ? Math.round((item.score / item.total) * 100) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const attempts = await db.attempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const topics = buildTopics(attempts);
    const weakTopics = topics.filter((topic) => topic.accuracy < 70).slice(0, 3);
    const dailyMinutes = Number(user.dailyMinutes) || 60;
    const focusTopic = weakTopics[0]?.topic || topics[0]?.topic || 'Your first topic';
    const secondTopic = weakTopics[1]?.topic || focusTopic;
    const thirdTopic = weakTopics[2]?.topic || secondTopic;

    const plan = [
      {
        day: 'Today',
        label: 'Focus',
        task: weakTopics[0]
          ? `Review ${focusTopic} and take a targeted quiz.`
          : 'Upload a study material and take your first quiz.',
        minutes: dailyMinutes,
        action: weakTopics[0] ? 'Practice weak topic' : 'Start quiz',
        href: weakTopics[0] ? `/quiz?topic=${encodeURIComponent(focusTopic)}` : '/materials',
      },
      {
        day: 'Tomorrow',
        label: 'Practice',
        task: `Strengthen ${secondTopic} with active recall and examples.`,
        minutes: Math.max(20, Math.round(dailyMinutes * 0.8)),
        action: 'Practice topic',
        href: `/quiz?topic=${encodeURIComponent(secondTopic)}`,
      },
      {
        day: 'Day 3',
        label: 'Revision',
        task: `Review mistakes from ${thirdTopic} and retest yourself.`,
        minutes: Math.max(20, Math.round(dailyMinutes * 0.7)),
        action: 'Take quiz',
        href: `/quiz?topic=${encodeURIComponent(thirdTopic)}`,
      },
      {
        day: 'Day 7',
        label: 'Exam simulation',
        task: 'Take a timed mock test and update your preparation score.',
        minutes: Math.max(30, dailyMinutes + 15),
        action: 'Start mock test',
        href: '/mock-test',
      },
    ];

    return NextResponse.json({
      exam: user.exam || 'Exam',
      dailyMinutes,
      weakTopics,
      plan,
      hasData: attempts.length > 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Could not build study plan.' }, { status: 500 });
  }
}
