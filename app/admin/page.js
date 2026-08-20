'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, BarChart3, BookOpen, Brain, CheckCircle2, FileText, MessageSquare, ShieldCheck, Sparkles, Users, WalletCards } from 'lucide-react';

const Stat = ({ icon: Icon, label, value, hint }) => (
  <div className="admin-stat">
    <div className="admin-stat-icon"><Icon size={18} /></div>
    <div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>
  </div>
);

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics', { credentials: 'include' })
      .then(async response => {
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Admin analytics unavailable.');
        setData(json);
      })
      .catch(err => setError(err.message));
  }, []);

  const activation = useMemo(() => {
    if (!data?.users) return 0;
    return Math.round((data.activeUsers / data.users) * 100);
  }, [data]);

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span>🎓</span><strong>Padh<span>AI</span></strong><small>Founder Console</small></div>
        <div className="admin-side-label">Product</div>
        <div className="admin-side-link active"><BarChart3 size={17} /> Overview</div>
        <div className="admin-side-link"><Users size={17} /> Users</div>
        <div className="admin-side-link"><Activity size={17} /> Usage</div>
        <div className="admin-side-link"><MessageSquare size={17} /> Feedback</div>
        <div className="admin-side-label">Business</div>
        <div className="admin-side-link"><WalletCards size={17} /> Revenue</div>
        <a className="admin-back" href="/dashboard">← Back to PadhAI</a>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar"><div><span className="eyebrow">Founder dashboard</span><h1>Product intelligence</h1><p>Real usage and validation signals — no invented metrics.</p></div><div className="admin-secure"><ShieldCheck size={16} /> Admin only</div></header>

        {error && <div className="admin-error"><strong>{error}</strong><span>Set ADMIN_EMAIL to the exact email of your logged-in account, then restart the server.</span></div>}

        {data && <>
          <div className="admin-stats">
            <Stat icon={Users} label="Users" value={data.users} hint={`${data.recentUsers} joined in 24h`} />
            <Stat icon={FileText} label="Uploaded PDFs" value={data.documents} hint={`${data.uploadedUsers} users activated`} />
            <Stat icon={Brain} label="Total attempts" value={data.attempts} hint={`${data.quizAttempts} quizzes · ${data.mockAttempts} mocks`} />
            <Stat icon={BarChart3} label="Average accuracy" value={`${data.accuracy}%`} hint="Across all attempts" />
          </div>

          <div className="admin-grid-two">
            <section className="admin-card">
              <div className="admin-card-head"><div><span className="eyebrow">Activation funnel</span><h2>Are users reaching the aha moment?</h2></div><Sparkles size={19} /></div>
              <div className="funnel">
                <div><span>Registered</span><strong>{data.users}</strong><div className="funnel-bar"><i style={{ width: '100%' }} /></div></div>
                <div><span>Uploaded material</span><strong>{data.uploadedUsers} · {data.users ? Math.round(data.uploadedUsers / data.users * 100) : 0}%</strong><div className="funnel-bar"><i style={{ width: `${data.users ? Math.min(100, data.uploadedUsers / data.users * 100) : 0}%` }} /></div></div>
                <div><span>Completed practice</span><strong>{data.activeUsers} · {activation}%</strong><div className="funnel-bar"><i style={{ width: `${activation}%` }} /></div></div>
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card-head"><div><span className="eyebrow">Feature usage</span><h2>What people actually use</h2></div><Activity size={19} /></div>
              <Usage label="AI Tutor / practice" value={data.attempts} max={Math.max(1, data.attempts)} />
              <Usage label="Quiz attempts" value={data.quizAttempts} max={Math.max(1, data.attempts)} />
              <Usage label="Mock tests" value={data.mockAttempts} max={Math.max(1, data.attempts)} />
              <Usage label="Uploaded materials" value={data.documents} max={Math.max(1, data.users)} />
            </section>
          </div>

          <div className="admin-grid-three">
            <section className="admin-card"><div className="mini-metric"><CheckCircle2 size={20} /><div><span>Would use again</span><strong>{data.returnYes}/{data.feedback}</strong></div></div><p>Strongest validation signal from beta feedback.</p></section>
            <section className="admin-card"><div className="mini-metric"><WalletCards size={20} /><div><span>Would pay</span><strong>{data.payYes}/{data.feedback}</strong></div></div><p>Use this real count in the business slide.</p></section>
            <section className="admin-card"><div className="mini-metric"><BookOpen size={20} /><div><span>Feedback</span><strong>{data.feedback}</strong></div></div><p>Keep collecting feedback before making growth claims.</p></section>
          </div>

          <section className="admin-card"><div className="admin-card-head"><div><span className="eyebrow">Validation</span><h2>Business-ready evidence</h2></div><ArrowUpRight size={19} /></div><div className="validation-table"><div><span>Feedback responses</span><strong>{data.feedback}</strong></div><div><span>Would return</span><strong>{data.returnYes}</strong></div><div><span>Would pay</span><strong>{data.payYes}</strong></div><div><span>Recent users (24h)</span><strong>{data.recentUsers}</strong></div></div></section>

          <section className="admin-card monetization-card"><div className="admin-card-head"><div><span className="eyebrow">Monetization model</span><h2>Pricing + scenario planning</h2></div><WalletCards size={19} /></div><div className="pricing-snapshot"><div><strong>Free</strong><span>NPR 0</span><small>Acquisition tier</small></div><div className="highlight"><strong>Student Pro</strong><span>NPR 199 / month</span><small>Primary paid plan</small></div><div><strong>Exam Pass</strong><span>NPR 999 / 3 months</span><small>Exam-season plan</small></div></div><div className="scenario-grid"><div><span>6 months · 100 paid users</span><strong>NPR 19,900 MRR</strong></div><div><span>12 months · 500 paid users</span><strong>NPR 99,500 MRR</strong></div><div><span>24 months · 2,000 paid users</span><strong>NPR 398,000 MRR</strong></div></div><p>Illustrative planning scenarios only — replace them with actual paid-user, churn and invoice data after launch.</p></section>
        </>}
      </section>
    </main>
  );
}

function Usage({ label, value, max }) {
  const percent = Math.round((value / max) * 100);
  return <div className="usage-row"><div><span>{label}</span><strong>{value}</strong></div><div className="usage-bar"><i style={{ width: `${Math.min(100, percent)}%` }} /></div></div>;
}
