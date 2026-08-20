"use client";

import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';

const fields = [
  ['ease', 'How easy was PadhAI to use?'],
  ['aiTutor', 'How useful was AI Tutor?'],
  ['quiz', 'How useful was Quiz?'],
  ['mockTest', 'How useful was Mock Test?'],
  ['weakTopics', 'How useful was Weak Topics?'],
  ['studyPlan', 'How useful was Study Plan?'],
];

export default function BetaFeedbackPage() {
  const [form, setForm] = useState({ ease: 5, aiTutor: 5, quiz: 5, mockTest: 5, weakTopics: 5, studyPlan: 5, wouldReturn: true, wouldPay: false, priceRange: '₹199', bestFeature: '', disliked: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/beta-feedback').then(r => r.json()).then(({ feedback }) => {
      if (feedback) setForm(f => ({ ...f, ...feedback }));
    }).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setSaved(false);
    const res = await fetch('/api/beta-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json(); setSaving(false);
    if (!res.ok) return alert(data.error || 'Could not save feedback');
    setSaved(true);
  };

  if (loading) return <><Nav/><main className="dashboard-main"><div className="container page"><div className="empty card">Loading feedback form...</div></div></main></>;

  return <><Nav/><main className="dashboard-main"><div className="container page">
    <div className="page-title"><div><div className="eyebrow">PadhAI Beta</div><h1>Help us improve PadhAI</h1><p className="muted">This takes about 2 minutes. Your honest feedback helps us build a better learning product.</p></div></div>
    <form className="card" onSubmit={submit}>
      <h3>Rate your experience</h3>
      {fields.map(([key, label]) => <label key={key} style={{display:'block', marginTop:18}}><strong>{label}</strong><div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>{[1,2,3,4,5].map(n => <button type="button" key={n} className={`btn ${Number(form[key])===n?'btn-primary':''}`} onClick={() => update(key, n)}>{n}</button>)}</div></label>)}
      <div style={{display:'grid', gap:16, marginTop:24}}>
        <label><strong>Would you use PadhAI again?</strong><select value={String(form.wouldReturn)} onChange={e=>update('wouldReturn', e.target.value==='true')}><option value="true">Yes</option><option value="false">No</option></select></label>
        <label><strong>Would you pay for PadhAI?</strong><select value={String(form.wouldPay)} onChange={e=>update('wouldPay', e.target.value==='true')}><option value="false">Not sure / No</option><option value="true">Yes</option></select></label>
        <label><strong>Reasonable monthly price</strong><select value={form.priceRange} onChange={e=>update('priceRange', e.target.value)}><option>₹99</option><option>₹199</option><option>₹299</option><option>₹399</option><option>₹499+</option></select></label>
        <label><strong>Most useful feature</strong><input value={form.bestFeature} onChange={e=>update('bestFeature', e.target.value)} placeholder="AI Tutor, Quiz, Mock Test, etc." /></label>
        <label><strong>What did you dislike?</strong><textarea value={form.disliked} onChange={e=>update('disliked', e.target.value)} rows={4} placeholder="Be honest — UI, speed, AI answers, anything." /></label>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:14,marginTop:22}}><button className="btn btn-primary" disabled={saving}>{saving?'Saving...':'Submit feedback'}</button>{saved&&<span className="muted">Thanks — feedback saved.</span>}</div>
    </form>
  </div></main></>;
}
