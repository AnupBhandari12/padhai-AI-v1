'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, RotateCcw, Sparkles, Target } from 'lucide-react';
import Nav from '@/components/Nav';

export default function MockTest() {
  const [topic, setTopic] = useState('');
  const [qs, setQs] = useState([]);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [sourceCount, setSourceCount] = useState(0);
  const [seconds, setSeconds] = useState(1200);
  const [current, setCurrent] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = new URLSearchParams(window.location.search).get('topic');
    if (saved) setTopic(saved);
  }, []);

  useEffect(() => {
    if (!qs.length || done || seconds <= 0) return;
    const timer = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [qs.length, done, seconds]);

  const answeredCount = Object.keys(answers).length;
  const timeLabel = useMemo(() => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`, [seconds]);

  async function generate() {
    if (!topic.trim()) {
      setMessage('Choose a subject or topic first.');
      return;
    }
    setLoading(true); setDone(null); setMessage(''); setCurrent(0); setSeconds(1200);
    try {
      const response = await fetch('/api/mock-test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), generateOnly: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate mock test.');
      setQs(data.questions || []); setAnswers({}); setSourceCount(data.sources?.length || 0);
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  }

  async function submit() {
    if (qs.some((_, index) => answers[index] === undefined)) {
      setMessage('Please answer every question before submitting.');
      return;
    }
    try {
      const response = await fetch('/api/mock-test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: qs, answers: qs.map((_, index) => answers[index] ?? -1), topic, type: 'mock-test' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit mock test.');
      setDone(data);
      setAttempts(current => [{ id: data.attemptId, score: data.score, total: data.total }, ...current]);
    } catch (error) { setMessage(error.message); }
  }

  function reset() {
    setQs([]); setAnswers({}); setDone(null); setCurrent(0); setMessage(''); setSeconds(1200);
  }

  const question = qs[current];

  return (
    <><Nav /><main className="dashboard-main"><div className="container page exam-page">
      <div className="page-title">
        <div><div className="eyebrow">Exam simulation</div><h1>Mock Test</h1><p className="muted">Turn your materials into a timed, exam-style practice session.</p></div>
        {qs.length > 0 && !done && <div className={`exam-timer ${seconds < 60 ? 'danger' : ''}`}><Clock3 size={17} /> {timeLabel}</div>}
      </div>

      {!qs.length && !done && <section className="card mock-setup">
        <div className="setup-icon"><Target size={22} /></div>
        <div><div className="eyebrow">Build your test</div><h2>Choose a subject or topic</h2><p className="muted">Use a chapter name for focused practice or type “Full syllabus” for a broad test.</p></div>
        <div className="mock-input-row"><input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Physics, Mechanics, Full syllabus" onKeyDown={e => e.key === 'Enter' && generate()} /><button className="btn btn-primary" onClick={generate} disabled={loading}><Sparkles size={16} />{loading ? 'Building test…' : 'Generate mock test'}</button></div>
        <div className="quick-topics"><button type="button" onClick={() => setTopic('Physics')}>Physics</button><button type="button" onClick={() => setTopic('Chemistry')}>Chemistry</button><button type="button" onClick={() => setTopic('Mathematics')}>Mathematics</button><button type="button" onClick={() => setTopic('Full syllabus')}>Full syllabus</button></div>
        {message && <div className="form-error">{message}</div>}
      </section>}

      {qs.length > 0 && !done && <>
        <div className="exam-progress card"><div><strong>Question {current + 1} of {qs.length}</strong><span>{answeredCount} answered</span></div><div className="progress"><div style={{ width: `${((current + 1) / qs.length) * 100}%` }} /></div><span>{sourceCount} source chunks</span></div>
        <section className="card question-focus">
          <div className="question-meta"><span>Question {current + 1}</span><span>{question.topic || topic}</span></div>
          <h2>{question.question}</h2>
          <div className="options-stack">{question.options.map((option, optionIndex) => {
            const selected = answers[current] === optionIndex;
            return <button type="button" key={optionIndex} className={`option exam-option ${selected ? 'selected' : ''}`} onClick={() => setAnswers(a => ({ ...a, [current]: optionIndex }))}>
              <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>{selected && <CheckCircle2 size={18} className="selected-check" />}
            </button>;
          })}</div>
          <div className="exam-actions"><button className="btn btn-secondary" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}><ArrowLeft size={16} /> Previous</button>{current < qs.length - 1 ? <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>Next <ArrowRight size={16} /></button> : <button className="btn btn-primary" onClick={submit}>Submit test <CheckCircle2 size={16} /></button>}</div>
          {message && <div className="form-error" style={{ marginTop: 14 }}>{message}</div>}
        </section>
        <div className="question-palette card">{qs.map((_, i) => <button type="button" key={i} className={`${i === current ? 'current' : ''} ${answers[i] !== undefined ? 'answered' : ''}`} onClick={() => setCurrent(i)}>{i + 1}</button>)}</div>
      </>}

      {done && <section className="card result-hero"><div className="result-icon"><CheckCircle2 size={28} /></div><div><div className="eyebrow">Test complete</div><h2>{done.score}/{done.total}</h2><p className="muted">{done.total ? Math.round(done.score / done.total * 100) : 0}% accuracy. Your weak-topic map has been updated.</p></div><div className="result-actions"><button className="btn btn-secondary" onClick={reset}><RotateCcw size={16} /> New test</button><a className="btn btn-primary" href="/progress">View progress <ArrowRight size={16} /></a></div></section>}

      {done && <section className="card answer-review"><div className="section-head"><div><div className="eyebrow">Review</div><h2>What to improve</h2></div></div>{qs.map((q, index) => <div className="review-row" key={index}><div className="review-status">{answers[index] === q.answer ? <CheckCircle2 size={18} /> : '×'}</div><div><strong>Q{index + 1}. {q.question}</strong><span>{answers[index] === q.answer ? 'Correct' : `Correct answer: ${q.options[q.answer]}`}</span></div></div>)}</section>}

      {!qs.length && !done && <div className="card empty" style={{ marginTop: 18 }}><Target size={24} /><strong>Ready when you are.</strong><span>Upload a PDF first for source-grounded questions.</span></div>}

      <section className="card attempts-card"><div className="section-head"><div><div className="eyebrow">History</div><h2>Recent attempts</h2></div></div>{attempts.length ? <div className="attempt-list">{attempts.map(a => <div className="attempt-row" key={a.id}><span>Mock Test</span><strong>{a.score}/{a.total}</strong><span>{a.total ? Math.round(a.score / a.total * 100) : 0}%</span></div>)}</div> : <div className="empty">Your new attempts will appear here after you submit a test.</div>}</section>
    </div></main></>
  );
}
