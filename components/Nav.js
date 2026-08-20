'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Brain, FileText, Target, ClipboardCheck, CalendarDays, BarChart3, UserRound, Sparkles, Layers3, ShieldCheck } from 'lucide-react';
import LogoutButton from './LogoutButton';

const links = [
  ['/dashboard', LayoutDashboard, 'Dashboard'],
  ['/materials', FileText, 'Materials'],
  ['/chat', Brain, 'AI Tutor'],
  ['/summary', Sparkles, 'AI Summary'],
  ['/flashcards', Layers3, 'Flashcards'],
  ['/quiz', Target, 'Quiz'],
  ['/mock-test', ClipboardCheck, 'Mock Test'],
  ['/study-plan', CalendarDays, 'Study Plan'],
  ['/progress', BarChart3, 'Progress'],
  ['/profile', UserRound, 'Profile'],
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="logo sidebar-logo">
        <span className="cap">🎓</span>
        <span className="brand-word">Padh<span>AI</span></span>
      </Link>

      <div className="sidebar-label">Study workspace</div>
      <nav className="sidebar-nav">
        {links.map(([href, Icon, label]) => {
          const active = pathname === href || (href !== '/dashboard' && pathname?.startsWith(`${href}/`));
          return (
            <Link
              href={href}
              key={href}
              className={`sidebar-link ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={17} strokeWidth={active ? 2.4 : 2} />
              <span>{label}</span>
              {active && <span className="nav-active-dot" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-spacer" />
      <div className="sidebar-bottom">
        <Link href="/admin" className="admin-link">
          <ShieldCheck size={16} />
          <span>Founder Admin</span>
        </Link>
        <div className="pro-card">
          <div className="pro-icon"><Sparkles size={15} /></div>
          <div>
            <strong>PadhAI Pro</strong>
            <span>More AI study tools.</span>
          </div>
          <Link href="/materials">Explore</Link>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
