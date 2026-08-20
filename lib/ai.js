export async function generateAnswer({ question, context, exam }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      answer: context
        ? `Demo mode: I found source material relevant to your question. Add OPENAI_API_KEY to enable the full tutor.\n\nBased on the retrieved source: ${context.split('\n').filter(Boolean).slice(1, 4).join(' ')}`
        : `Demo mode is active and no matching source was found. Add your PDF material first, then ask a question.`,
      citations: extractCitations(context)
    };
  }
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const prompt = `You are PadhAI, an exam-preparation tutor for ${exam}. Use the supplied sources as the primary evidence. Do not invent facts from the sources. If the answer is not supported, say that clearly. Explain simply, include a concise exam tip, and cite supporting source numbers like [Source 1].\n\nSOURCES:\n${context || 'No relevant sources were found.'}\n\nQUESTION:\n${question}`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0.2, messages: [{ role: 'system', content: 'You are a careful, source-grounded education assistant.' }, { role: 'user', content: prompt }] })
  });
  if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
  const json = await response.json();
  return { answer: json.choices?.[0]?.message?.content || 'No answer generated.', citations: extractCitations(context) };
}

export async function generateQuestions({ exam, topic, count, context, mode = 'quiz' }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const prompt = `Create ${count} multiple-choice questions for a ${exam || 'exam'} student. Topic: ${topic}. Mode: ${mode}. Prefer the supplied study material and avoid unsupported claims. Return ONLY valid JSON array. Each object must have: question (string), options (exactly 4 strings), answer (integer 0-3), explanation (string), topic (string).\n\nSTUDY MATERIAL:\n${context || 'No material found. Use reliable general exam knowledge.'}`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0.4, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'You produce structured educational question data.' }, { role: 'user', content: prompt }] })
  });
  if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
  const json = await response.json();
  const text = json.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.items || []);
  return list.map((q) => ({
    question: String(q.question || '').trim(),
    options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [],
    answer: Number(q.answer),
    explanation: String(q.explanation || ''),
    topic: String(q.topic || topic),
  })).filter(q => q.question && q.options.length === 4 && q.answer >= 0 && q.answer < 4);
}

function extractCitations(context) {
  if (!context) return [];
  return context.split('\n\n').filter((x) => x.startsWith('SOURCE ')).map((x) => x.split('\n')[0].replace(/^SOURCE \d+:\s*/, ''));
}

export async function generateStudyArtifact({ type, topic, context, exam }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const snippets = (context || '').split('\n\n').filter(Boolean).slice(0, 5);
    if (type === 'summary') {
      return {
        title: `${topic} — Quick Revision`,
        content: snippets.map((x, i) => `### ${i + 1}. ${x.split('\n')[0].replace(/^SOURCE \d+:\s*/, '')}\n${x.split('\n').slice(1).join(' ').slice(0, 500)}`).join('\n\n'),
        demo: true
      };
    }
    return {
      cards: snippets.slice(0, 8).map((x, i) => {
        const lines=x.split('\n'); const text=lines.slice(1).join(' ').trim();
        return { front:`What should you remember from source ${i+1}?`, back:text.slice(0,420) || 'Review this source carefully.' };
      }),
      demo: true
    };
  }
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const instruction = type === 'summary'
    ? `Create concise exam revision notes from the supplied sources. Return JSON with title and content. Content should use markdown headings, bullets, key formulas where present, and a final "Exam tip". Do not add unsupported facts.`
    : `Create 8-12 useful study flashcards from the supplied sources. Return JSON with a cards array. Each card has front and back strings. Questions should test understanding, definitions, formulas, and common exam traps. Do not add unsupported facts.`;
  const prompt = `${instruction}\nExam: ${exam}\nTopic: ${topic}\n\nSOURCES:\n${context || 'No sources found.'}`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},
    body:JSON.stringify({model,temperature:.3,response_format:{type:'json_object'},messages:[{role:'system',content:'You are PadhAI, a source-grounded exam tutor.'},{role:'user',content:prompt}]})
  });
  if(!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
  const json=await response.json();
  const parsed=JSON.parse(json.choices?.[0]?.message?.content||'{}');
  return type==='summary' ? {title:String(parsed.title||`${topic} Summary`),content:String(parsed.content||'')} : {cards:Array.isArray(parsed.cards)?parsed.cards.slice(0,12):[]};
}
