'use client';

import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import { Save, UserRound } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load profile.');
        setUser(data.user || data);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save() {
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          exam: user.exam || '',
          subjects: user.subjects || [],
          goal: user.goal || '',
          dailyMinutes: Number(user.dailyMinutes) || 60,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to update profile.');
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <><Nav /><main className="dashboard-main"><div className="container page"><div className="card empty"><span className="spinner" /> Loading profile…</div></div></main></>;

  if (!user) return <><Nav /><main className="dashboard-main"><div className="container page"><div className="card form-error">{message || 'Unable to load your profile.'}</div></div></main></>;

  return (
    <>
      <Nav />
      <main className="dashboard-main">
        <div className="container page profile-page">
          <div className="page-title">
            <div><div className="eyebrow">Your account</div><h1>Profile</h1><p className="muted">Keep your exam goals and daily study target up to date.</p></div>
          </div>

          <div className="profile-grid">
            <section className="card profile-identity">
              <div className="profile-avatar"><UserRound size={24} /></div>
              <h2>{user.name || 'PadhAI Student'}</h2>
              <p className="muted">{user.email}</p>
              <div className="profile-meta">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div>
              <div className="profile-goal"><span>Current goal</span><strong>{user.goal || 'Crack the exam'}</strong></div>
            </section>

            <section className="card">
              <div className="section-head"><div><div className="eyebrow">Preferences</div><h2>Study settings</h2></div></div>
              <div className="form-stack profile-form">
                <label><span>Exam</span><input value={user.exam || ''} onChange={e => setUser({ ...user, exam: e.target.value })} placeholder="e.g. Engineering Entrance" /></label>
                <label><span>Goal</span><input value={user.goal || ''} onChange={e => setUser({ ...user, goal: e.target.value })} placeholder="e.g. Score above 80%" /></label>
                <label><span>Daily study minutes</span><input type="number" min="15" max="600" value={user.dailyMinutes || 60} onChange={e => setUser({ ...user, dailyMinutes: e.target.value })} /></label>
              </div>
              <button type="button" className="btn btn-primary" style={{ marginTop: 18 }} onClick={save} disabled={saving}><Save size={16} />{saving ? 'Saving…' : 'Save changes'}</button>
              {message && <p className={message.includes('success') ? 'badge-success' : 'form-error'} style={{ marginTop: 12 }}>{message}</p>}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
