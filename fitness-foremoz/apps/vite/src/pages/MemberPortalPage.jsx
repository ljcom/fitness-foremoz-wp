import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSession } from '../lib.js';

export default function MemberPortalPage() {
  const session = getSession();
  const [tab, setTab] = useState('membership');
  const [feedback, setFeedback] = useState('');

  return (
    <main className="dashboard">
      <header className="dash-head card">
        <div>
          <p className="eyebrow">Member Portal</p>
          <h1>{session?.user?.fullName || 'Member'}</h1>
          <p>{session?.user?.email || '-'}</p>
        </div>
        <div className="meta">
          <code>role: member</code>
          <code>{session?.tenant?.namespace || '-'}</code>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar card">
          <button className={`side-item ${tab === 'membership' ? 'active' : ''}`} onClick={() => setTab('membership')}>
            Buy membership
          </button>
          <button className={`side-item ${tab === 'pt_booking' ? 'active' : ''}`} onClick={() => setTab('pt_booking')}>
            Self booking PT
          </button>
        </aside>

        <article className="card admin-main">
          {tab === 'membership' ? (
            <>
              <p className="eyebrow">Membership</p>
              <h2>Buy membership package</h2>
              <div className="entity-list">
                <div className="entity-row"><div><strong>Monthly Unlimited</strong><p>30 days access</p></div><strong>IDR 650.000</strong></div>
                <div className="entity-row"><div><strong>Quarterly Plan</strong><p>90 days access</p></div><strong>IDR 1.800.000</strong></div>
              </div>
              <button className="btn" onClick={() => setFeedback('payment.recorded queued for membership purchase')}>
                Buy selected package
              </button>
            </>
          ) : null}

          {tab === 'pt_booking' ? (
            <>
              <p className="eyebrow">PT Booking</p>
              <h2>Self booking PT</h2>
              <div className="entity-list">
                <div className="entity-row"><div><strong>Coach Raka</strong><p>HIIT / Strength</p></div><strong>08 Mar 2026 18:00</strong></div>
                <div className="entity-row"><div><strong>Coach Dini</strong><p>Mobility / Recovery</p></div><strong>09 Mar 2026 16:00</strong></div>
              </div>
              <button className="btn" onClick={() => setFeedback('pt.session.booked queued from member portal')}>
                Book PT session
              </button>
            </>
          ) : null}

          {feedback ? <p className="feedback">{feedback}</p> : null}
        </article>
      </section>

      <footer className="dash-foot"><Link to="/web">Back to web</Link></footer>
    </main>
  );
}
