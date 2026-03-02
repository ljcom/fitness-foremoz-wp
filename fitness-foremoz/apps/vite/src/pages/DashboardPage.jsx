import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL, clearSession, getSession } from '../lib.js';

function Stat({ label, value }) {
  return (
    <article className="stat">
      <p>{label}</p>
      <h3>{value}</h3>
    </article>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const session = getSession();

  const namespace = session?.tenant?.namespace || '-';
  const chain = session?.branch?.chain || 'core';

  const stats = useMemo(
    () => [
      { label: 'active subscription', value: 128 },
      { label: 'today checkin', value: 94 },
      { label: 'today booking', value: 36 },
      { label: 'pending payment', value: 11 }
    ],
    []
  );

  function signOut() {
    clearSession();
    navigate('/signin', { replace: true });
  }

  return (
    <main className="dashboard">
      <header className="dash-head card">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>{session?.tenant?.gym_name || 'Foremoz Fitness Tenant'}</h1>
          <p>{session?.user?.email || '-'}</p>
        </div>
        <div className="meta">
          <code>namespace: {namespace}</code>
          <code>chain: {chain}</code>
          <code>api: {API_BASE_URL}</code>
          <button className="btn ghost" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <section className="stats-grid">
        {stats.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value} />
        ))}
      </section>

      <section className="ops-grid">
        <article className="card">
          <h2>Membership</h2>
          <p>Track member, plan, subscription state.</p>
          <ul>
            <li>member registration</li>
            <li>subscription activation</li>
            <li>freeze and expiry control</li>
          </ul>
        </article>

        <article className="card">
          <h2>Booking + PT Session</h2>
          <p>Handle class booking capacity and PT balance.</p>
          <ul>
            <li>class slot availability</li>
            <li>member and guest booking</li>
            <li>PT package and PT session usage</li>
          </ul>
        </article>

        <article className="card">
          <h2>Attendance + Payment</h2>
          <p>Confirm operations with checkin and payment queue.</p>
          <ul>
            <li>manual and QR checkin</li>
            <li>daily attendance projection</li>
            <li>payment confirmation queue</li>
          </ul>
        </article>
      </section>

      <footer className="dash-foot">
        <Link to="/">Back to landing</Link>
      </footer>
    </main>
  );
}
