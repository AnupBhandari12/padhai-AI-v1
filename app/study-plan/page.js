'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { CalendarDays, Clock3, Flame, Target, Sparkles, ArrowRight, TriangleAlert, CheckCircle2 } from 'lucide-react';

export default function StudyPlanPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/study-plan')
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Unable to load study plan.');
        setData(json);
      })
      .catch((err) => setError(err.message));
  }, []);

  const focus = useMemo(() => data?.weakTopics?.[0], [data]);

  return (
    <div className="app-shell">
      <Nav />
      <main className="dashboard-main">
        <div className="container page">
          <div className="page-title">
            <div>
              <div className="eyebrow">Personalized learning</div>
              <h1>Your Study Plan</h1>
              <p className="muted">PadhAI turns your weak topics, quiz history and study time into a practical revision plan.</p>
            </div>
            <Link href="/progress" className="btn btn-secondary">View progress <ArrowRight size={16} /></Link>
          </div>

          {error && <div className="card form-error">{error}</div>}
          {!data && !error && <div className="card empty">Building your personalized study plan…</div>}

          {data && (
            <>
              <div className="stats five">
                <Stat label="Exam" value={data.exam} icon={<Target size={18} />} />
                <Stat label="Daily goal" value={`${data.dailyMinutes} min`} icon={<Clock3 size={18} />} />
                <Stat label="Weak topics" value={data.weakTopics.length} icon={<TriangleAlert size={18} />} />
                <Stat label="Plan horizon" value="7 days" icon={<CalendarDays size={18} />} />
                <Stat label="Mode" value="Adaptive" icon={<Sparkles size={18} />} />
              </div>

              <div className="dashboard-grid top-grid">
                <section className="card focus-card">
                  <div className="eyebrow">Focus now</div>
                  <h2>{focus ? focus.topic : 'Build your learning map'}</h2>
                  <p className="muted">
                    {focus
                      ? `${focus.accuracy}% accuracy · ${focus.score}/${focus.total} correct. This is your highest-priority topic.`
                      : 'Complete a quiz so PadhAI can identify the topics that need the most attention.'}
                  </p>
                  <Link href={focus ? `/quiz?topic=${encodeURIComponent(focus.topic)}` : '/quiz'} className="btn btn-primary">
                    {focus ? 'Practice weak topic' : 'Start first quiz'} <ArrowRight size={16} />
                  </Link>
                </section>

                <section className="card continue-card">
                  <div className="section-head">
                    <div>
                      <div className="eyebrow">Your routine</div>
                      <h2>Learn → Practice → Retest</h2>
                    </div>
                    <Flame size={20} />
                  </div>
                  <div className="mini-list">
                    <div className="mini-item"><CheckCircle2 size={18} /><div><strong>Learn</strong><span>Review the source material first.</span></div></div>
                    <div className="mini-item"><CheckCircle2 size={18} /><div><strong>Practice</strong><span>Use AI quiz to test active recall.</span></div></div>
                    <div className="mini-item"><CheckCircle2 size={18} /><div><strong>Retest</strong><span>Use a mock test to measure improvement.</span></div></div>
                  </div>
                </section>
              </div>

              <section className="card">
                <div className="section-head">
                  <div>
                    <div className="eyebrow">Adaptive schedule</div>
                    <h2>Next 7 days</h2>
                  </div>
                </div>
                <div className="plan-list">
                  {data.plan.map((item) => (
                    <div className="plan-row" key={item.day}>
                      <div className="plan-day"><strong>{item.day}</strong><span>{item.label}</span></div>
                      <div className="plan-main"><strong>{item.task}</strong><span><Clock3 size={14} /> {item.minutes} min</span></div>
                      <Link href={item.href} className="btn btn-secondary">{item.action} <ArrowRight size={15} /></Link>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card">
                <div className="section-head">
                  <div>
                    <div className="eyebrow">Why this plan?</div>
                    <h2>Built from your actual performance</h2>
                  </div>
                </div>
                {data.hasData ? (
                  <div className="topic-list">
                    {data.weakTopics.length ? data.weakTopics.map((topic) => (
                      <div className="topic-row" key={topic.topic}>
                        <div className="topic-main"><strong>{topic.topic}</strong><span>{topic.accuracy}% accuracy · {topic.score}/{topic.total} correct</span></div>
                        <div className="topic-bar"><div style={{ width: `${topic.accuracy}%` }} /></div>
                        <Link href={`/quiz?topic=${encodeURIComponent(topic.topic)}`} className="icon-link"><ArrowRight size={16} /></Link>
                      </div>
                    )) : <div className="empty">No weak topics detected yet. Keep practising and PadhAI will adapt the plan automatically.</div>}
                  </div>
                ) : (
                  <div className="empty">Your plan is ready. Start with a PDF and first quiz, then this page will personalize itself from your real results.</div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className="stat-row"><span className="big-stat">{value}</span>{icon}</div>
    </div>
  );
}
