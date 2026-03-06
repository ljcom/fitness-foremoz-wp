import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiJson, getSession, requireField, setSession } from '../lib.js';

function normalizeHandle(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    displayName: session?.coach?.displayName || '',
    handle: session?.coach?.handle || '',
    mainLocation: '',
    packagePlan: session?.coach?.packagePlan || 'free'
  });

  const micrositeUrl = useMemo(
    () => (form.handle ? `https://coach.foremoz.com/${form.handle}` : 'https://coach.foremoz.com/<coach_handle>'),
    [form.handle]
  );

  function onChange(e) {
    const { name, value } = e.target;
    if (name === 'handle') {
      setForm((prev) => ({ ...prev, handle: normalizeHandle(value) }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const displayName = requireField(form.displayName, 'display name');
      const handle = normalizeHandle(requireField(form.handle, 'coach handle'));
      if (handle.length < 3) {
        throw new Error('coach handle min length is 3 characters');
      }

      const tenantId = session?.tenant?.id || 'ch_001';
      const coachId = session?.coach?.id || session?.user?.userId;
      if (!coachId) {
        throw new Error('coach_id is missing from session');
      }

      await apiJson('/v1/coach/profile/publish', {
        method: 'POST',
        body: JSON.stringify({
          tenant_id: tenantId,
          coach_id: coachId,
          coach_handle: handle,
          display_name: displayName,
          bio: null
        })
      });

      await apiJson('/v1/pricing/plan/change', {
        method: 'POST',
        body: JSON.stringify({
          tenant_id: tenantId,
          coach_id: coachId,
          plan_code: form.packagePlan || 'free',
          plan_status: 'active'
        })
      });

      setSession({
        ...(session || {}),
        isAuthenticated: true,
        isOnboarded: true,
        tenant: {
          id: tenantId
        },
        coach: {
          ...(session?.coach || {}),
          id: coachId,
          displayName,
          handle,
          mainLocation: form.mainLocation || null,
          packagePlan: form.packagePlan || 'free'
        }
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Onboarding</p>
        <h1>Setup your coach profile</h1>
        <p className="subtext">This creates your public microsite and starter workspace.</p>

        <form className="form" onSubmit={submit}>
          <label>
            Coach display name
            <input name="displayName" value={form.displayName} onChange={onChange} />
          </label>
          <label>
            Coach handle
            <input name="handle" value={form.handle} onChange={onChange} placeholder="coach-raka" />
          </label>
          <label>
            Main location
            <input name="mainLocation" value={form.mainLocation} onChange={onChange} placeholder="Kuningan" />
          </label>
          <label>
            Package
            <select name="packagePlan" value={form.packagePlan} onChange={onChange}>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="pro_team">Pro/Team</option>
            </select>
          </label>

          <div className="hint">
            <strong>Microsite URL</strong>
            <span>{micrositeUrl}</span>
          </div>

          {error ? <p className="error">{error}</p> : null}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save and open dashboard'}
          </button>
        </form>
      </section>
    </main>
  );
}
