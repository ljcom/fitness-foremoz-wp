import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiJson, getOwnerSetup, getSession, setOwnerSetup, setSession } from '../lib.js';

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: 'IDR 0 / bulan',
    note: 'Cocok untuk mulai uji operasional basic gym kecil.'
  },
  {
    key: 'basic',
    name: 'Basic',
    price: 'IDR 299.000 / bulan',
    note: 'Untuk gym berkembang yang butuh alur sales dan PT lebih rapi.'
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 'IDR 799.000 / bulan',
    note: 'Fitur lengkap untuk multi-role operation dengan skala lebih besar.'
  }
];

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

export default function WebOwnerPage() {
  const navigate = useNavigate();
  const session = getSession();
  const existingSetup = getOwnerSetup();
  const tenantId = useMemo(() => existingSetup?.tenant_id || session?.tenant?.id || 'tn_001', [existingSetup, session]);

  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [setupForm, setSetupForm] = useState({
    gym_name: existingSetup?.gym_name || session?.tenant?.gym_name || '',
    account_slug: existingSetup?.account_slug || session?.tenant?.account_slug || '',
    package_plan: existingSetup?.package_plan || 'free',
    tenant_id: existingSetup?.tenant_id || session?.tenant?.id || 'tn_001',
    branch_id: existingSetup?.branch_id || session?.branch?.id || ''
  });

  const [saasForm, setSaasForm] = useState({ months: '1', note: '' });
  const [saasInfo, setSaasInfo] = useState(null);
  const [userForm, setUserForm] = useState({ full_name: '', email: '', role: 'staff', password: '' });
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState('');
  const [editingUser, setEditingUser] = useState({ full_name: '', role: 'staff' });

  async function refreshOwnerData(targetTenantId) {
    const activeTenant = targetTenantId || setupForm.tenant_id || tenantId;
    const [setupRes, saasRes, usersRes] = await Promise.all([
      apiJson(`/v1/owner/setup?tenant_id=${encodeURIComponent(activeTenant)}`),
      apiJson(`/v1/owner/saas?tenant_id=${encodeURIComponent(activeTenant)}`),
      apiJson(`/v1/owner/users?tenant_id=${encodeURIComponent(activeTenant)}&status=active`)
    ]);

    if (setupRes.row) {
      setSetupForm((prev) => ({
        ...prev,
        gym_name: setupRes.row.gym_name || prev.gym_name,
        tenant_id: setupRes.row.tenant_id || prev.tenant_id,
        branch_id: setupRes.row.branch_id || prev.branch_id,
        account_slug: setupRes.row.account_slug || prev.account_slug
      }));
      setOwnerSetup({
        gym_name: setupRes.row.gym_name,
        tenant_id: setupRes.row.tenant_id,
        branch_id: setupRes.row.branch_id,
        account_slug: setupRes.row.account_slug,
        package_plan: setupForm.package_plan
      });
    }

    setSaasInfo(saasRes.row || null);
    setUsers(usersRes.rows || []);
  }

  useEffect(() => {
    refreshOwnerData(tenantId).catch((error) => setFeedback(error.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  function continueToPlan() {
    const gymName = setupForm.gym_name.trim();
    const accountSlug = normalizeSlug(setupForm.account_slug || gymName);
    if (!gymName || !accountSlug) return;

    const tenantDefault = setupForm.tenant_id || `tn_${accountSlug.replace(/-/g, '_')}`;
    const branchDefault = setupForm.branch_id || `br_${accountSlug.replace(/-/g, '_')}_main`;

    setSetupForm((prev) => ({
      ...prev,
      gym_name: gymName,
      account_slug: accountSlug,
      tenant_id: tenantDefault,
      branch_id: branchDefault
    }));
    setStep(2);
  }

  async function submitSetup(e) {
    e.preventDefault();
    if (!setupForm.gym_name || !setupForm.account_slug || !setupForm.package_plan) return;

    try {
      setLoading(true);
      const payload = {
        gym_name: setupForm.gym_name,
        tenant_id: setupForm.tenant_id,
        branch_id: setupForm.branch_id,
        account_slug: normalizeSlug(setupForm.account_slug),
        package_plan: setupForm.package_plan
      };

      await apiJson('/v1/owner/setup/save', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setOwnerSetup(payload);
      if (session?.isAuthenticated && (session?.role || 'owner') === 'owner') {
        setSession({
          ...session,
          isOnboarded: true,
          tenant: {
            id: payload.tenant_id,
            account_slug: payload.account_slug,
            namespace: `foremoz:fitness:${payload.tenant_id}`,
            gym_name: payload.gym_name
          },
          branch: {
            id: payload.branch_id,
            chain: `branch:${payload.branch_id}`
          }
        });
      }

      setFeedback(
        `owner.setup.saved package ${payload.package_plan} namespace foremoz:fitness:${payload.tenant_id} chain branch:${payload.branch_id}`
      );
      await refreshOwnerData(payload.tenant_id);
      navigate(`/a/${payload.account_slug}/dashboard`, { replace: true });
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteSetup() {
    try {
      setLoading(true);
      await apiJson(`/v1/owner/setup?tenant_id=${encodeURIComponent(setupForm.tenant_id || tenantId)}`, {
        method: 'DELETE'
      });
      setOwnerSetup(null);
      setFeedback(`owner.setup.deleted ${setupForm.tenant_id || tenantId}`);
      await refreshOwnerData(setupForm.tenant_id || tenantId);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitSaas(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await apiJson('/v1/owner/saas/extend', {
        method: 'POST',
        body: JSON.stringify({
          tenant_id: setupForm.tenant_id || tenantId,
          months: Number(saasForm.months),
          note: saasForm.note
        })
      });
      setFeedback(`owner.saas.extended +${saasForm.months} month(s)`);
      setSaasForm({ months: '1', note: '' });
      await refreshOwnerData(setupForm.tenant_id || tenantId);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitUser(e) {
    e.preventDefault();
    if (!userForm.full_name || !userForm.email || !userForm.password) return;

    try {
      setLoading(true);
      await apiJson('/v1/owner/users', {
        method: 'POST',
        body: JSON.stringify({
          tenant_id: setupForm.tenant_id || tenantId,
          full_name: userForm.full_name,
          email: userForm.email,
          role: userForm.role,
          password: userForm.password
        })
      });
      setFeedback(`owner.user.created ${userForm.full_name}`);
      setUserForm({ full_name: '', email: '', role: 'staff', password: '' });
      await refreshOwnerData(setupForm.tenant_id || tenantId);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  }

  function startEditUser(user) {
    setEditingUserId(user.user_id);
    setEditingUser({ full_name: user.full_name || '', role: user.role || 'staff' });
  }

  async function saveEditUser(userId) {
    try {
      setLoading(true);
      await apiJson(`/v1/owner/users/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          tenant_id: setupForm.tenant_id || tenantId,
          full_name: editingUser.full_name,
          role: editingUser.role
        })
      });
      setEditingUserId('');
      setFeedback(`owner.user.updated ${userId}`);
      await refreshOwnerData(setupForm.tenant_id || tenantId);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(userId) {
    try {
      setLoading(true);
      await apiJson(`/v1/owner/users/${encodeURIComponent(userId)}?tenant_id=${encodeURIComponent(setupForm.tenant_id || tenantId)}`, {
        method: 'DELETE'
      });
      setFeedback(`owner.user.deleted ${userId}`);
      await refreshOwnerData(setupForm.tenant_id || tenantId);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard">
      <header className="dash-head card">
        <div>
          <p className="eyebrow">Web Owner</p>
          <h1>Owner setup wizard</h1>
          <p>Lengkapi nama tenant, pilih paket, dan kelola setup dari satu panel.</p>
        </div>
        <div className="meta">
          <button className="btn ghost" onClick={() => navigate('/signin')}>Owner sign in</button>
          <button className="btn ghost" onClick={() => navigate('/web')}>Back to web</button>
        </div>
      </header>

      <section className="card wide wizard" style={{ marginTop: '1rem' }}>
        <div className="wizard-steps">
          <span className={step === 1 ? 'active' : ''}>1. Penamaan</span>
          <span className={step === 2 ? 'active' : ''}>2. Paket</span>
        </div>

        {step === 1 ? (
          <div>
            <p className="eyebrow">Step 1</p>
            <h2>Penamaan tenant</h2>
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                continueToPlan();
              }}
            >
              <label>
                Nama gym
                <input
                  placeholder="Contoh: Foremoz Fitness Cilandak"
                  value={setupForm.gym_name}
                  onChange={(e) => setSetupForm((p) => ({ ...p, gym_name: e.target.value }))}
                />
              </label>
              <label>
                Account slug
                <input
                  placeholder="contoh: foremoz-cilandak"
                  value={setupForm.account_slug}
                  onChange={(e) => setSetupForm((p) => ({ ...p, account_slug: normalizeSlug(e.target.value) }))}
                />
              </label>
              <button className="btn" type="submit" disabled={loading}>Lanjut pilih paket</button>
            </form>
          </div>
        ) : (
          <form className="form" onSubmit={submitSetup}>
            <p className="eyebrow">Step 2</p>
            <h2>Pilih paket</h2>
            <div className="plan-grid">
              {PLANS.map((plan) => (
                <button
                  type="button"
                  key={plan.key}
                  className={`plan-card ${setupForm.package_plan === plan.key ? 'selected' : ''}`}
                  onClick={() => setSetupForm((p) => ({ ...p, package_plan: plan.key }))}
                >
                  <strong>{plan.name}</strong>
                  <p>{plan.price}</p>
                  <small>{plan.note}</small>
                </button>
              ))}
            </div>
            <label>
              tenant_id
              <input value={setupForm.tenant_id} onChange={(e) => setSetupForm((p) => ({ ...p, tenant_id: e.target.value }))} />
            </label>
            <label>
              branch_id
              <input value={setupForm.branch_id} onChange={(e) => setSetupForm((p) => ({ ...p, branch_id: e.target.value }))} />
            </label>
            <div className="member-actions">
              <button className="btn ghost" type="button" onClick={() => setStep(1)} disabled={loading}>Kembali</button>
              <button className="btn" type="submit" disabled={loading}>Simpan setup</button>
              <button className="btn ghost" type="button" onClick={deleteSetup} disabled={loading}>Delete setup</button>
            </div>
          </form>
        )}
      </section>

      <section className="admin-grid" style={{ marginTop: '1rem' }}>
        <article className="card admin-panel">
          <p className="eyebrow">SaaS</p>
          <h2>Perpanjang membership SaaS</h2>
          {saasInfo ? <p className="feedback">Total extended months: {saasInfo.total_months || 0}</p> : null}
          <form className="form" onSubmit={submitSaas}>
            <label>
              tambah_bulan
              <select value={saasForm.months} onChange={(e) => setSaasForm((p) => ({ ...p, months: e.target.value }))}>
                <option value="1">1</option>
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="12">12</option>
              </select>
            </label>
            <label>
              note
              <input value={saasForm.note} onChange={(e) => setSaasForm((p) => ({ ...p, note: e.target.value }))} />
            </label>
            <button className="btn" type="submit" disabled={loading}>Perpanjang</button>
          </form>
        </article>

        <article className="card admin-panel">
          <p className="eyebrow">User</p>
          <h2>Add user</h2>
          <div className="entity-list">
            {users.map((u) => (
              <div className="entity-row" key={u.user_id}>
                <div>
                  {editingUserId === u.user_id ? (
                    <>
                      <input value={editingUser.full_name} onChange={(e) => setEditingUser((p) => ({ ...p, full_name: e.target.value }))} />
                      <select value={editingUser.role} onChange={(e) => setEditingUser((p) => ({ ...p, role: e.target.value }))}>
                        <option value="staff">staff</option>
                        <option value="manager">manager</option>
                        <option value="admin">admin</option>
                        <option value="sales">sales</option>
                        <option value="pt">pt</option>
                        <option value="owner">owner</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <strong>{u.full_name}</strong>
                      <p>{u.email} - {u.role}</p>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {editingUserId === u.user_id ? (
                    <button className="btn" onClick={() => saveEditUser(u.user_id)} disabled={loading}>Save</button>
                  ) : (
                    <button className="btn ghost" onClick={() => startEditUser(u)} disabled={loading}>Edit</button>
                  )}
                  <button className="btn ghost" onClick={() => deleteUser(u.user_id)} disabled={loading}>Delete</button>
                </div>
              </div>
            ))}
          </div>
          <form className="form" onSubmit={submitUser}>
            <label>
              full_name
              <input value={userForm.full_name} onChange={(e) => setUserForm((p) => ({ ...p, full_name: e.target.value }))} />
            </label>
            <label>
              email
              <input type="email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} />
            </label>
            <label>
              password
              <input type="password" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} />
            </label>
            <label>
              role
              <select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}>
                <option value="staff">staff</option>
                <option value="manager">manager</option>
                <option value="admin">admin</option>
                <option value="sales">sales</option>
                <option value="pt">pt</option>
                <option value="owner">owner</option>
              </select>
            </label>
            <button className="btn" type="submit" disabled={loading}>Add user</button>
          </form>
        </article>
      </section>

      {feedback ? <p className="feedback">{feedback}</p> : null}

      <footer className="dash-foot">
        <Link to="/web">Back to web landing</Link>
      </footer>
    </main>
  );
}
