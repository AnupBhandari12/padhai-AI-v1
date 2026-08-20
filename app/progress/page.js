'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { ArrowRight, Brain, Target, TrendingUp, TriangleAlert, CheckCircle2 } from 'lucide-react';

export default function ProgressPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/progress').then(async r => {
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Unable to load progress');
      setData(j);
    }).catch(e => setError(e.message));
  }, []);

  const max = useMemo(() => Math.max(100, ...(data?.topics || []).map(x => x.total)), [data]);

  return <div className="app-shell"><Nav/><main className="dashboard-main"><div className="container page progress-page">
    <div className="page-title"><div><div className="eyebrow">Your performance</div><h1>Weak Topics & Progress</h1><p className="muted">PadhAI turns every quiz and mock-test attempt into a personalized study map.</p></div></div>
    {error ? <div className="card form-error">{error}</div> : !data ? <div className="card empty">Loading your progress…</div> : <>
      <div className="stats five">
        <Stat title="Overall accuracy" value={`${data.summary.accuracy}%`} icon={<TrendingUp size={18}/>} />
        <Stat title="Recent accuracy" value={`${data.summary.recentAccuracy}%`} icon={<Target size={18}/>} />
        <Stat title="Questions solved" value={data.summary.total} icon={<Brain size={18}/>} />
        <Stat title="Attempts" value={data.summary.attempts} icon={<CheckCircle2 size={18}/>} />
        <Stat title="Preparation" value={`${data.summary.progress}%`} icon={<TrendingUp size={18}/>} progress={data.summary.progress} />
      </div>

      <div className="progress-grid">
        <section className="card"><div className="section-head"><div><div className="eyebrow">Focus now</div><h2>Weakest topics</h2></div><TriangleAlert size={20} color="#f79009"/></div>
          {data.weakTopics.length ? <div className="topic-list">{data.weakTopics.map((t) => <div className="topic-row" key={t.topic}><div className="topic-main"><strong>{t.topic}</strong><span>{t.score}/{t.total} correct · {t.accuracy}%</span></div><div className="topic-bar"><div style={{width:`${t.accuracy}%`}}/></div><Link href={`/quiz?topic=${encodeURIComponent(t.topic)}`} className="icon-link"><ArrowRight size={16}/></Link></div>)}</div> : <div className="empty">No weak topics yet. Complete a quiz or mock test and PadhAI will identify them automatically.</div>}
        </section>
        <section className="card"><div className="section-head"><div><div className="eyebrow">Topic mastery</div><h2>All tracked topics</h2></div></div>
          {data.topics.length ? <div className="topic-list">{data.topics.map((t) => <div className="mastery-row" key={t.topic}><div><strong>{t.topic}</strong><span>{t.total} questions · {t.accuracy}%</span></div><div className="mastery-meter"><div style={{width:`${t.accuracy}%`}}/></div><b>{t.accuracy}%</b></div>)}</div> : <div className="empty">Start your first quiz to build your mastery map.</div>}
        </section>
      </div>

      <section className="card"><div className="section-head"><div><div className="eyebrow">Recent activity</div><h2>Your latest attempts</h2></div><Link href="/mock-test" className="btn btn-secondary">Take another test</Link></div>
        {data.recent.length ? <div className="activity-list">{data.recent.map(a => <div className="activity-row" key={a.id}><span className="activity-dot"/><div><strong>{a.type === 'quiz' ? 'AI Quiz' : 'Mock Test'}</strong><span>{a.topic} · {new Date(a.createdAt).toLocaleString()}</span></div><b>{a.score}/{a.total} · {a.accuracy}%</b></div>)}</div> : <div className="empty"><p>No attempts yet.</p><Link href="/quiz" className="btn btn-primary">Start your first quiz</Link></div>}
      </section>
    </>}
  </div></main></div>
}

function Stat({title,value,icon,progress}) { return <div className="card"><div className="stat-label">{title}</div><div className="stat-row"><span className="big-stat">{value}</span>{icon}</div>{typeof progress === 'number' && <div className="progress" style={{marginTop:10}}><div style={{width:`${progress}%`}}/></div>}</div> }
