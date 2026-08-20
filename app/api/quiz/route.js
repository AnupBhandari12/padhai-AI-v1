import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { retrieveContext, buildContext } from '@/lib/rag';
import { generateQuestions } from '@/lib/ai';
import { fallbackQuestions } from '@/lib/questions';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { topic = 'General', count = 5 } = await request.json();
    const chunks = await retrieveContext(user.id, String(topic), 10);
    const questions = await generateQuestions({
      exam: user.exam,
      topic: String(topic),
      count: Math.min(Number(count) || 5, 10),
      context: buildContext(chunks),
      mode: 'quiz',
    });
    const n = Math.min(Number(count) || 5, 10); const finalQuestions = questions.length ? questions : Array.from({length:n}, (_, i) => ({ ...fallbackQuestions[i % fallbackQuestions.length], topic: String(topic) }));
    return NextResponse.json({ questions: finalQuestions, sources: chunks.map(c => ({ id: c.id, title: c.document.title, fileName: c.document.fileName, content: c.content })) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Quiz generation failed.' }, { status: 500 });
  }
}
