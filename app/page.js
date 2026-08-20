import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, FileText, Target, Sparkles, ClipboardCheck, BarChart3, Check } from 'lucide-react';

const features = [
  [FileText, 'Your Materials', 'Upload PDFs, notes and question papers into one focused study library.'],
  [Brain, 'Source-grounded AI Tutor', 'Ask questions and get explanations anchored to your own material.'],
  [Sparkles, 'AI Revision', 'Turn chapters into concise summaries and active-recall flashcards.'],
  [Target, 'Smart Practice', 'Generate quizzes from your material and learn from every mistake.'],
  [ClipboardCheck, 'Mock Tests', 'Take timed exam-style tests with scoring, review and weak-topic signals.'],
  [BarChart3, 'Adaptive Study Loop', 'Use performance to decide what to practice next instead of guessing.'],
];

const plans = [
  { name: 'Free', price: 'NPR 0', note: 'For trying the workflow', items: ['3 study materials', '20 AI questions / month', '3 quizzes / month', '1 mock test / month'], cta: 'Start free' },
  { name: 'Student Pro', price: 'NPR 199', suffix: '/month', note: 'For serious daily preparation', featured: true, items: ['Unlimited study materials', '300 AI questions / month', 'Unlimited quizzes & flashcards', '10 mock tests / month', 'Weak-topic study plan'], cta: 'Choose Pro' },
  { name: 'Exam Pass', price: 'NPR 999', suffix: '/3 months', note: 'For an intensive exam season', items: ['Everything in Pro', 'Unlimited mock tests', 'Advanced progress insights', 'Exam-focused revision loop'], cta: 'Get Exam Pass' },
];

export default function Home() {
  return (
    <main className="landing-shell">
      <header className="header landing-header"><div className="container nav">
        <Link href="/" className="logo"><span className="logo-mark">🎓</span>Padh<span>AI</span></Link>
        <nav className="landing-nav"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#how">How it works</a></nav>
        <div className="landing-actions"><Link className="btn btn-secondary" href="/login">Login</Link><Link className="btn btn-primary" href="/register">Start free <ArrowRight size={16}/></Link></div>
      </div></header>

      <section className="hero landing-hero container">
        <span className="badge"><Sparkles size={14}/> AI-powered exam preparation</span>
        <h1>Your notes. Your AI tutor. <span>Your exam plan.</span></h1>
        <p>PadhAI turns your PDFs, notes and previous questions into a personalized study workspace — tutor, summary, flashcards, quiz, mock test and revision in one loop.</p>
        <div className="actions"><Link className="btn btn-primary btn-lg" href="/register">Start studying free <ArrowRight size={18}/></Link><Link className="btn btn-secondary btn-lg" href="/materials">See the workspace</Link></div>
        <div className="hero-proof"><span>✓ Source-grounded answers</span><span>✓ Exam-style practice</span><span>✓ Weak-topic coaching</span></div>
      </section>

      <section id="features" className="section container"><div className="section-intro"><span className="eyebrow">One study workspace</span><h2>From understanding to improvement</h2><p className="muted">NotebookLM-style grounding, combined with an exam-specific practice loop.</p></div><div className="grid grid-3">{features.map(([Icon,title,text])=><div className="card feature-card" key={title}><div className="feature-icon"><Icon size={22}/></div><h3>{title}</h3><p className="muted">{text}</p></div>)}</div></section>

      <section id="how" className="section container"><div className="workflow-card"><div><span className="eyebrow">The PadhAI loop</span><h2>Upload → Understand → Practice → Improve</h2><p className="muted">Instead of jumping between PDFs, chatbots and question banks, PadhAI keeps the whole learning loop together.</p></div><div className="workflow-steps"><span>01 Upload</span><span>02 Ask AI</span><span>03 Practice</span><span>04 Diagnose</span><span>05 Revise</span></div><Link className="btn btn-primary" href="/dashboard">Open workspace <ArrowRight size={16}/></Link></div></section>

      <section id="pricing" className="section pricing-section"><div className="container"><div className="section-intro"><span className="eyebrow">Simple student pricing</span><h2>Pay for a better preparation loop</h2><p className="muted">Start free. Upgrade when personalized practice saves you enough time to matter.</p></div><div className="pricing-grid">{plans.map(plan=><div className={`pricing-card ${plan.featured?'featured':''}`} key={plan.name}>{plan.featured&&<div className="pricing-popular">Most practical</div>}<span className="pricing-name">{plan.name}</span><div className="pricing-price">{plan.price}<small>{plan.suffix}</small></div><p className="muted">{plan.note}</p><div className="pricing-items">{plan.items.map(item=><div key={item}><Check size={16}/><span>{item}</span></div>)}</div><Link className={`btn ${plan.featured?'btn-primary':'btn-secondary'} btn-full`} href="/register">{plan.cta}</Link></div>)}</div><p className="pricing-footnote">Estimated model and infrastructure costs are controlled through source retrieval, capped usage on free tiers and smaller models for routine generation.</p></div></section>

      <section className="section container"><div className="cta-card"><div><span className="eyebrow">Built for Nepal first</span><h2>Start with CEE, IOE, Loksewa and expand.</h2><p>Exam profiles, local pricing and real student feedback are part of the roadmap.</p></div><Link className="btn btn-primary" href="/register">Build your study system <ArrowRight size={16}/></Link></div></section>

      <footer className="landing-footer"><div className="container"><span>© 2026 PadhAI</span><div><Link href="/beta-feedback">Give feedback</Link><Link href="/login">Login</Link><Link href="/register">Create account</Link></div></div></footer>
    </main>
  );
}
