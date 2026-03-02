import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSession } from '../lib.js';

export default function SalesPage() {
  const session = getSession();
  const [prospect, setProspect] = useState({ full_name: '', phone: '', source: 'instagram' });
  const [items, setItems] = useState([
    { prospect_id: 'lead_001', full_name: 'Arif', phone: '081355550001', source: 'instagram', stage: 'new' },
    { prospect_id: 'lead_002', full_name: 'Mira', phone: '081366660002', source: 'walkin', stage: 'follow_up' }
  ]);

  function addProspect(e) {
    e.preventDefault();
    if (!prospect.full_name || !prospect.phone) return;
    setItems((prev) => [
      { prospect_id: `lead_${Date.now()}`, full_name: prospect.full_name, phone: prospect.phone, source: prospect.source, stage: 'new' },
      ...prev
    ]);
    setProspect({ full_name: '', phone: '', source: 'instagram' });
  }

  return (
    <main className="dashboard">
      <header className="dash-head card">
        <div>
          <p className="eyebrow">Sales Workspace</p>
          <h1>{session?.user?.fullName || 'Sales'}</h1>
          <p>Prospect pipeline</p>
        </div>
        <div className="meta"><code>role: sales</code><code>{session?.tenant?.namespace || '-'}</code></div>
      </header>

      <section className="card admin-main" style={{ marginTop: '1rem' }}>
        <h2>Prospect list</h2>
        <div className="entity-list">
          {items.map((item) => (
            <div className="entity-row" key={item.prospect_id}>
              <div>
                <strong>{item.full_name}</strong>
                <p>{item.phone} - {item.source} - {item.stage}</p>
              </div>
              <button className="btn ghost" onClick={() => setItems((prev) => prev.filter((v) => v.prospect_id !== item.prospect_id))}>Delete</button>
            </div>
          ))}
        </div>

        <form className="form" onSubmit={addProspect}>
          <label>full_name<input value={prospect.full_name} onChange={(e) => setProspect((p) => ({ ...p, full_name: e.target.value }))} /></label>
          <label>phone<input value={prospect.phone} onChange={(e) => setProspect((p) => ({ ...p, phone: e.target.value }))} /></label>
          <label>source<select value={prospect.source} onChange={(e) => setProspect((p) => ({ ...p, source: e.target.value }))}><option value="instagram">instagram</option><option value="walkin">walkin</option><option value="referral">referral</option><option value="whatsapp">whatsapp</option></select></label>
          <button className="btn" type="submit">Add prospect</button>
        </form>
      </section>

      <footer className="dash-foot"><Link to="/web">Back to web</Link></footer>
    </main>
  );
}
