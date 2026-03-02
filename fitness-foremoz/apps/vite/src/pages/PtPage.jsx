import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSession } from '../lib.js';

export default function PtPage() {
  const session = getSession();
  const [activity, setActivity] = useState({ member_id: '', note: '', session_at: '' });
  const [logs, setLogs] = useState([
    { activity_id: 'pta_001', member_id: 'mem_4471', note: 'Mobility warmup + strength block', session_at: '2026-03-03 07:00' }
  ]);

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
        <div className="meta"><code>role: pt</code><code>{session?.tenant?.namespace || '-'}</code></div>
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
