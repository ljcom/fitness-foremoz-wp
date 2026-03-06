import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getSession } from '../lib.js';

const locationClasses = [
  { location: 'Kuningan', studio: 'Forge Fitness', className: 'Strength Reset', slot: '18/24', time: '18:30' },
  { location: 'Kemang', studio: 'Pulse Studio', className: 'Mobility Engine', slot: '9/16', time: '07:00' },
  { location: 'Senayan', studio: 'Arena Lab', className: 'Conditioning Blast', slot: '22/24', time: '19:00' }
];

const channels = [
  { name: 'WhatsApp', share: 160, click: 109, subscribe: 33 },
  { name: 'Instagram', share: 98, click: 77, subscribe: 26 },
  { name: 'TikTok', share: 81, click: 66, subscribe: 21 }
];

const team = [
  { name: 'Siska', role: 'cs', area: 'Kuningan', status: 'active' },
  { name: 'Andre', role: 'cs', area: 'Kemang', status: 'active' },
  { name: 'Rico', role: 'cs', area: 'Senayan', status: 'shift' }
];

const plans = [
  { code: 'free', name: 'Free', price: 'Rp0', detail: 'Microsite + basic join flow' },
  { code: 'starter', name: 'Starter', price: 'Rp99.000', detail: 'Attribution + larger class limits' },
  { code: 'growth', name: 'Growth', price: 'Rp299.000', detail: 'Advanced funnel analytics' },
  { code: 'pro_team', name: 'Pro/Team', price: 'Rp799.000', detail: 'Support team + onsite flow' }
];

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'classes', label: 'Join Classes' },
  { id: 'channels', label: 'Channel Funnel' },
  { id: 'team', label: 'Support Team' },
  { id: 'pricing', label: 'Pricing' }
];

function OverviewSection({ session }) {
  return (
    <article className="card">
      <h2>Coach Workspace Overview</h2>
      <p className="sub">
        Microsite promo + operasional kelas lokasi untuk {session?.coach?.displayName || session?.user?.fullName || 'Coach'}.
      </p>
      <ul className="list compact">
        <li className="row">
          <div>
            <strong>Microsite</strong>
            <p>coach.foremoz.com/{session?.coach?.handle || 'coach-demo'}</p>
          </div>
          <span className="pill ok">active</span>
        </li>
        <li className="row">
          <div>
            <strong>Onboarding Status</strong>
            <p>Profile, package, and invite flow configured.</p>
          </div>
          <span className="pill ok">ready</span>
        </li>
      </ul>
    </article>
  );
}

function ClassesSection() {
  return (
    <article className="card">
      <h2>Join Class by Location</h2>
      <p className="sub">Active classes across linked studios.</p>
      <ul className="list">
        {locationClasses.map((row) => (
          <li className="row" key={`${row.location}-${row.className}`}>
            <div>
              <strong>{row.className}</strong>
              <p>{row.studio} · {row.location}</p>
            </div>
            <div className="right">
              <span>{row.time}</span>
              <small>Slot {row.slot}</small>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ChannelsSection() {
  return (
    <article className="card">
      <h2>Channel Funnel</h2>
      <p className="sub">Share -&gt; Click -&gt; Subscribe performance.</p>
      <div className="channels">
        {channels.map((c) => (
          <div className="metric" key={c.name}>
            <strong>{c.name}</strong>
            <span>Share {c.share}</span>
            <span>Click {c.click}</span>
            <span>Subscribe {c.subscribe}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function TeamSection() {
  return (
    <article className="card">
      <h2>Support Team (Higher Tier)</h2>
      <p className="sub">Onsite re-registration and assisted check-in.</p>
      <ul className="list compact">
        {team.map((t) => (
          <li className="row" key={t.name}>
            <div>
              <strong>{t.name}</strong>
              <p>{t.role} · {t.area}</p>
            </div>
            <span className={`pill ${t.status === 'active' ? 'ok' : 'warn'}`}>{t.status}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function PricingSection({ activePlan }) {
  return (
    <article className="card plan-card">
      <h2>Pricing Tiers</h2>
      <p className="sub">Free tier always available.</p>
      <ul className="list compact">
        {plans.map((p) => (
          <li className="row" key={p.code}>
            <div>
              <strong>{p.name}</strong>
              <p>{p.detail}</p>
            </div>
            <div className="right">
              <span>{p.price}</span>
              {activePlan.code === p.code ? <small className="current">Current</small> : null}
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [activeSection, setActiveSection] = useState('overview');

  const activePlan = useMemo(() => {
    return plans.find((p) => p.code === session?.coach?.packagePlan) || plans[0];
  }, [session]);

  function logout() {
    clearSession();
    navigate('/signin', { replace: true });
  }

  function renderSection() {
    if (activeSection === 'classes') return <ClassesSection />;
    if (activeSection === 'channels') return <ChannelsSection />;
    if (activeSection === 'team') return <TeamSection />;
    if (activeSection === 'pricing') return <PricingSection activePlan={activePlan} />;
    return <OverviewSection session={session} />;
  }

  return (
    <main className="page dashboard-layout">
      <aside className="sidebar card">
        <p className="eyebrow">coach.foremoz.com/{session?.coach?.handle || 'coach-demo'}</p>
        <h2 className="sidebar-title">Coach Dashboard</h2>
        <nav className="side-nav" aria-label="Dashboard sections">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`side-link ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
              type="button"
            >
              {section.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-actions">
          <button className="btn primary">Copy Campaign Link</button>
          <Link className="btn ghost" to="/onboarding">Edit Onboarding</Link>
          <button className="btn ghost" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <section className="dashboard-content">
        {renderSection()}
        <section className="footer-note">
          <p>Mockup mode: signup/signin/onboarding/dashboard pattern aligned with fitness flow.</p>
        </section>
      </section>
    </main>
  );
}
