import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getAccountSlug, getSession } from '../lib.js';

export default function PtPage() {
  const navigate = useNavigate();
  const session = getSession();
  const accountSlug = getAccountSlug(session);
  const role = String(session?.role || 'pt').toLowerCase();
  const [targetEnv, setTargetEnv] = useState('pt');
  const [activity, setActivity] = useState({ member_id: '', note: '', session_at: '' });
  const [logs, setLogs] = useState([
    { activity_id: 'pta_001', member_id: 'mem_4471', note: 'Mobility warmup + strength block', session_at: '2026-03-03 07:00' }
  ]);
  const allowedEnv = useMemo(() => {
    if (role === 'owner' || role === 'admin') return ['admin', 'cs', 'pt', 'sales'];
    if (role === 'cs') return ['cs'];
    if (role === 'pt') return ['pt'];
    if (role === 'sales') return ['sales'];
    return [];
  }, [role]);

  function goToEnv(env) {
    if (!allowedEnv.includes(env)) return;
    if (env === 'admin') {
      navigate(`/a/${accountSlug}/admin/dashboard`);
      return;
    }
    if (env === 'sales') {
      navigate(`/a/${accountSlug}/sales/dashboard`);
      return;
    }
    if (env === 'pt') {
      navigate(`/a/${accountSlug}/pt/dashboard`);
      return;
    }
    navigate(`/a/${accountSlug}/cs/dashboard`);
  }

  function signOut() {
    clearSession();
    navigate(`/a/${accountSlug}`, { replace: true });
  }

  function addActivity(e) {
    e.preventDefault();
    if (!activity.member_id || !activity.note || !activity.session_at) return;
    setLogs((prev) => [{ activity_id: `pta_${Date.now()}`, ...activity }, ...prev]);
    setActivity({ member_id: '', note: '', session_at: '' });
  }

  return (
    <main className="dashboard">
      <header className="dash-head card">
        <div>
          <p className="eyebrow">PT Workspace</p>
          <h1>{session?.user?.fullName || 'PT'}</h1>
          <p>Log member PT activity</p>
        </div>
        <div className="meta">
          {allowedEnv.length > 0 ? (
            <label>
              Environment
              <select
                value={targetEnv}
                onChange={(e) => {
                  const next = e.target.value;
                  setTargetEnv(next);
                  goToEnv(next);
                }}
              >
                {allowedEnv.map((env) => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button className="btn ghost" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <section className="card admin-main" style={{ marginTop: '1rem' }}>
        <h2>PT activity log</h2>
        <div className="entity-list">
          {logs.map((item) => (
            <div className="entity-row" key={item.activity_id}>
              <div>
                <strong>{item.member_id}</strong>
                <p>{item.session_at} - {item.note}</p>
              </div>
              <button className="btn ghost" onClick={() => setLogs((prev) => prev.filter((v) => v.activity_id !== item.activity_id))}>Delete</button>
            </div>
          ))}
        </div>

        <form className="form" onSubmit={addActivity}>
          <label>member_id<input value={activity.member_id} onChange={(e) => setActivity((p) => ({ ...p, member_id: e.target.value }))} /></label>
          <label>session_at<input type="datetime-local" value={activity.session_at} onChange={(e) => setActivity((p) => ({ ...p, session_at: e.target.value }))} /></label>
          <label>activity_note<input value={activity.note} onChange={(e) => setActivity((p) => ({ ...p, note: e.target.value }))} /></label>
          <button className="btn" type="submit">Log activity</button>
        </form>
      </section>

      <footer className="dash-foot"><Link to="/web">Back to web</Link></footer>
    </main>
  );
}
