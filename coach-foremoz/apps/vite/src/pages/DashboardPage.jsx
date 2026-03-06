import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiJson, clearSession, getSession } from '../lib.js';

const FALLBACK_CLASSES = [
  { location: 'Kuningan', studio: 'Forge Fitness', className: 'Strength Reset', slot: '18/24', time: '18:30' },
  { location: 'Kemang', studio: 'Pulse Studio', className: 'Mobility Engine', slot: '9/16', time: '07:00' },
  { location: 'Senayan', studio: 'Arena Lab', className: 'Conditioning Blast', slot: '22/24', time: '19:00' }
];

const FALLBACK_CHANNELS = [
  { name: 'WhatsApp', share: 160, click: 109, subscribe: 33 },
  { name: 'Instagram', share: 98, click: 77, subscribe: 26 },
  { name: 'TikTok', share: 81, click: 66, subscribe: 21 }
];

const FALLBACK_TEAM = [
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

function formatClassTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

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

function ClassesSection({ rows }) {
  return (
    <article className="card">
      <h2>Join Class by Location</h2>
      <p className="sub">Active classes across linked studios.</p>
      <ul className="list">
        {rows.map((row) => (
          <li className="row" key={`${row.location}-${row.className}-${row.time}`}>
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

function ChannelsSection({ rows }) {
  return (
    <article className="card">
      <h2>Channel Funnel</h2>
      <p className="sub">Share -&gt; Click -&gt; Subscribe performance.</p>
      <div className="channels">
        {rows.map((c) => (
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

function TeamSection({ rows }) {
  return (
    <article className="card">
      <h2>Support Team (Higher Tier)</h2>
      <p className="sub">Onsite re-registration and assisted check-in.</p>
      <ul className="list compact">
        {rows.map((t) => (
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
  const [classesRows, setClassesRows] = useState(FALLBACK_CLASSES);
  const [channelRows, setChannelRows] = useState(FALLBACK_CHANNELS);
  const [teamRows, setTeamRows] = useState(FALLBACK_TEAM);
  const [planCode, setPlanCode] = useState(session?.coach?.packagePlan || 'free');
  const [apiStatus, setApiStatus] = useState('loading');
  const [apiError, setApiError] = useState('');

  const activePlan = useMemo(() => {
    return plans.find((p) => p.code === planCode) || plans[0];
  }, [planCode]);

  useEffect(() => {
    const tenantId = session?.tenant?.id || 'ch_001';
    const coachId = session?.coach?.id || session?.user?.userId;
    if (!coachId) {
      setApiStatus('error');
      setApiError('coach_id missing in session');
      return;
    }

    async function load() {
      try {
        setApiStatus('loading');
        setApiError('');
        await apiJson('/v1/projections/run', {
          method: 'POST',
          body: JSON.stringify({ tenant_id: tenantId })
        });

        const [classesRes, funnelRes, supportRes, pricingRes] = await Promise.all([
          apiJson(`/v1/read/classes/location?tenant_id=${encodeURIComponent(tenantId)}`),
          apiJson(`/v1/read/funnel?tenant_id=${encodeURIComponent(tenantId)}`),
          apiJson(`/v1/read/support-team?tenant_id=${encodeURIComponent(tenantId)}`),
          apiJson(`/v1/read/pricing-plan?tenant_id=${encodeURIComponent(tenantId)}`)
        ]);

        const cls = (classesRes.items || [])
          .filter((item) => item.coach_id === coachId)
          .map((item) => ({
            location: item.location_id || '-',
            studio: item.studio_id || 'Studio',
            className: item.class_id || 'Class',
            slot: `${Number(item.booked_count || 0)}/${Number(item.capacity || 0)}`,
            time: formatClassTime(item.start_at)
          }));
        if (cls.length > 0) setClassesRows(cls);

        const funnelByChannel = new Map();
        for (const item of funnelRes.items || []) {
          if (item.coach_id !== coachId) continue;
          const key = item.source_channel || 'direct';
          const current = funnelByChannel.get(key) || { name: key, share: 0, click: 0, subscribe: 0 };
          current.share += Number(item.share_count || 0);
          current.click += Number(item.click_count || 0);
          current.subscribe += Number(item.subscribe_count || 0);
          funnelByChannel.set(key, current);
        }
        const channelData = Array.from(funnelByChannel.values());
        if (channelData.length > 0) setChannelRows(channelData);

        const support = (supportRes.items || [])
          .filter((item) => item.coach_id === coachId && item.is_active)
          .map((item) => ({
            name: item.team_member_id,
            role: item.role_name || 'cs',
            area: item.location_scope ? 'multi-location' : '-',
            status: item.is_active ? 'active' : 'inactive'
          }));
        if (support.length > 0) setTeamRows(support);

        const pricing = (pricingRes.items || []).find((item) => item.coach_id === coachId);
        if (pricing?.plan_code) setPlanCode(pricing.plan_code);

        setApiStatus('ok');
      } catch (error) {
        setApiStatus('error');
        setApiError(error.message);
      }
    }

    load();
  }, [session?.coach?.id, session?.tenant?.id, session?.user?.userId]);

  function logout() {
    clearSession();
    navigate('/signin', { replace: true });
  }

  function renderSection() {
    if (activeSection === 'classes') return <ClassesSection rows={classesRows} />;
    if (activeSection === 'channels') return <ChannelsSection rows={channelRows} />;
    if (activeSection === 'team') return <TeamSection rows={teamRows} />;
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
          <button className="btn primary" type="button">Copy Campaign Link</button>
          <Link className="btn ghost" to="/onboarding">Edit Onboarding</Link>
          <button className="btn ghost" type="button" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <section className="dashboard-content">
        {renderSection()}
        <section className="footer-note">
          {apiStatus === 'loading' ? <p>Connecting to coach API...</p> : null}
          {apiStatus === 'ok' ? <p>Live API connected (EventDB projection active).</p> : null}
          {apiStatus === 'error' ? <p>API fallback mode: {apiError}</p> : null}
        </section>
      </section>
    </main>
  );
}
