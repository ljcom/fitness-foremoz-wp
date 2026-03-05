import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { apiJson, getOwnerSetup, requireField, setSession } from '../lib.js';

const OPEN_MOCKUP_ACCESS = (import.meta.env.VITE_MOCKUP_OPEN_ACCESS ?? 'false') === 'true';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const fullName = requireField(form.fullName, 'full name');
      const email = requireField(form.email, 'email');
      const password = requireField(form.password, 'password');

      if (!OPEN_MOCKUP_ACCESS) {
        const setup = getOwnerSetup();
        const tenantId = setup?.tenant_id || 'tn_001';
        const result = await apiJson('/v1/tenant/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            tenant_id: tenantId,
            full_name: fullName,
            email,
            password,
            role: 'owner'
          })
        });

        setSession({
          isAuthenticated: true,
          isOnboarded: Boolean(setup?.tenant_id && setup?.branch_id && setup?.account_slug),
          role: 'owner',
          user: {
            fullName: result.user?.full_name || fullName,
            email: result.user?.email || email,
            userId: result.user?.user_id || null
          },
          tenant: {
            id: tenantId,
            account_slug: setup?.account_slug || tenantId,
            namespace: `foremoz:fitness:${tenantId}`,
            gym_name: setup?.gym_name || 'Foremoz Demo Gym'
          },
          branch: setup
            ? {
              id: setup.branch_id,
              chain: `branch:${setup.branch_id}`
            }
            : { id: 'br_jkt_01', chain: 'branch:br_jkt_01' },
          auth: {
            tokenType: result.auth?.token_type || 'Bearer',
            accessToken: result.auth?.access_token || null,
            expiresIn: result.auth?.expires_in || null
          }
        });

        navigate('/web/owner', { replace: true });
        return;
      }

      const setup = getOwnerSetup();

      setSession({
        isAuthenticated: true,
        isOnboarded: Boolean(setup?.tenant_id && setup?.branch_id && setup?.account_slug),
        role: 'admin',
        user: { fullName, email },
        tenant: setup
          ? {
            id: setup.tenant_id,
            account_slug: setup.account_slug,
            namespace: `foremoz:fitness:${setup.tenant_id}`,
            gym_name: setup.gym_name
          }
          : null,
        branch: setup
          ? {
            id: setup.branch_id,
            chain: `branch:${setup.branch_id}`
          }
          : null
      });

      navigate('/web/owner', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create owner account"
      subtitle="Setup tenant workspace and branch operations."
      alternateHref="/signin"
      alternateText="Already owner? Sign in"
    >
      <form className="card form" onSubmit={submit}>
        {OPEN_MOCKUP_ACCESS ? (
          <p className="error">Mock mode aktif: signup ini tidak membuat akun ke backend.</p>
        ) : null}
        <label>
          Full name
          <input name="fullName" value={form.fullName} onChange={handleChange} />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Continue to onboarding'}
        </button>
      </form>
    </AuthLayout>
  );
}
