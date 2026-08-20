'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, GraduationCap, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Login failed.'); setLoading(false); return; }
    router.push('/dashboard'); router.refresh();
  }

  return <main className="auth-shell">
    <div className="auth-orb orb-one"/><div className="auth-orb orb-two"/>
    <section className="auth-brand-side"><Link href="/" className="logo logo-light"><GraduationCap size={28}/>Padh<span>AI</span></Link><div className="auth-brand-copy"><span className="badge badge-light"><Sparkles size={14}/> AI-powered study companion</span><h1>पढाइ अब <em>अझै स्मार्ट।</em></h1><p>Turn your notes, PDFs and previous questions into a personalized study system.</p><div className="auth-points"><div>✓ AI Tutor from your own materials</div><div>✓ Personalized quizzes & mock tests</div><div>✓ Weak-topic based revision</div></div></div></section>
    <section className="auth-card-wrap"><div className="auth-card"><div className="auth-card-head"><div className="brand-mark">P<span>AI</span></div><h2>Welcome back 👋</h2><p>Continue your smart preparation journey.</p></div><form onSubmit={submit} className="form-stack"><label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<div className="input-with-icon"><input type={show?'text':'password'} required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Enter your password"/><button type="button" className="icon-button" onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>{error&&<div className="form-error">{error}</div>}<button className="btn btn-primary btn-full" disabled={loading}>{loading?'Signing in...':'Login'}</button></form><div className="divider"><span>or continue with</span></div><button className="social-button" disabled>Continue with Google <small>Coming soon</small></button><p className="auth-bottom">Don&apos;t have an account? <Link href="/register">Create account</Link></p></div></section>
  </main>;
}
