import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { apiJson, normalizeEmail, requireField, setSession } from '../lib.js';

export default function SignInPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const email = normalizeEmail(requireField(form.email, 'email'));
      const password = requireField(form.password, 'password');
      const result = await apiJson('/v1/tenant/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const tenantId = result.user?.tenant_id;
      const coachId = result.user?.coach_id;
      const [profileRes, planRes] = await Promise.all([
        apiJson(`/v1/coach/profile?tenant_id=${encodeURIComponent(tenantId)}&coach_id=${encodeURIComponent(coachId)}`),
        apiJson(`/v1/read/pricing-plan?tenant_id=${encodeURIComponent(tenantId)}`)
      ]);
      const profile = profileRes.item || null;
      const activePlan = (planRes.items || []).find((item) => item.coach_id === coachId) || null;
      const isOnboarded = Boolean(profile?.coach_handle && profile?.display_name);

      setSession({
        isAuthenticated: true,
        isOnboarded,
        role: 'owner',
        user: {
          userId: coachId,
          fullName: result.user?.full_name,
          email: result.user?.email
        },
        tenant: {
          id: tenantId
        },
        coach: {
          id: coachId,
          handle: profile?.coach_handle || '',
          displayName: profile?.display_name || '',
          mainLocation: '',
          packagePlan: activePlan?.plan_code || 'free'
        }
      });

      navigate(isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Access your coach workspace, onboarding, and dashboard."
      alternateHref="/signup"
      alternateText="Need account? Create one"
    >
      <form className="form" onSubmit={submit}>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={onChange} />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={onChange} />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
