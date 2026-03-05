import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import {
  apiJson,
  getOwnerSetup,
  getSession,
  requireField,
  setSession
} from '../lib.js';

const OPEN_MOCKUP_ACCESS = (import.meta.env.VITE_MOCKUP_OPEN_ACCESS ?? 'false') === 'true';

export default function SignInPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
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
      const email = requireField(form.email, 'email');
      const password = requireField(form.password, 'password');
      const role = 'owner';

      if (!OPEN_MOCKUP_ACCESS) {
        const setup = getOwnerSetup();
        const tenantId = setup?.tenant_id || getSession()?.tenant?.id || 'tn_001';
        const result = await apiJson('/v1/tenant/auth/signin', {
          method: 'POST',
          body: JSON.stringify({
            tenant_id: tenantId,
            email,
            password,
            role
          })
        });
        if ((result.user?.role || role) !== 'owner') {
          throw new Error('Akun ini bukan owner. /signin hanya untuk owner.');
        }

        const nextSession = {
          ...(getSession() || {}),
          isAuthenticated: true,
          isOnboarded: Boolean(setup?.tenant_id && setup?.branch_id && setup?.account_slug),
          role: 'owner',
          user: {
            fullName: result.user?.full_name || 'Operator',
            email: result.user?.email || email,
            userId: result.user?.user_id || null
          },
          tenant: {
            id: tenantId,
            account_slug: setup?.account_slug || tenantId,
            namespace: `foremoz:fitness:${tenantId}`,
            gym_name: setup?.gym_name || 'Foremoz Demo Gym'
          },
          branch: {
            id: setup?.branch_id || 'br_jkt_01',
            chain: `branch:${setup?.branch_id || 'br_jkt_01'}`
          },
          auth: {
            tokenType: result.auth?.token_type || 'Bearer',
            accessToken: result.auth?.access_token || null,
            expiresIn: result.auth?.expires_in || null
          }
        };
        setSession(nextSession);
        navigate('/web/owner', { replace: true });
        return;
      }

      const current = getSession();
      const user = { ...(current?.user || {}), fullName: current?.user?.fullName || 'Operator', email };
      const setup = getOwnerSetup();
      const isOnboarded = Boolean(
        current?.isOnboarded
        || (setup?.tenant_id && setup?.branch_id && setup?.account_slug)
      );
      const tenant = current?.tenant || {
        id: setup?.tenant_id || 'tn_001',
        account_slug: setup?.account_slug || current?.tenant?.account_slug || 'tn_001',
        namespace: `foremoz:fitness:${setup?.tenant_id || 'tn_001'}`,
        gym_name: setup?.gym_name || 'Foremoz Demo Gym'
      };
      const nextSession = {
        ...(current || {}),
        isAuthenticated: true,
        isOnboarded,
        role: 'owner',
        user,
        tenant: {
          ...tenant,
          account_slug: tenant.account_slug || 'tn_001'
        },
        branch: current?.branch || { id: 'br_jkt_01', chain: 'branch:br_jkt_01' }
      };

      setSession(nextSession);
      navigate('/web/owner', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Owner sign in"
      subtitle="Sign in as owner to manage tenant setup and access."
      alternateHref="/signup"
      alternateText="Need owner account? Create one"
    >
      <form className="card form" onSubmit={submit}>
        {OPEN_MOCKUP_ACCESS ? (
          <p className="error">Mock mode aktif: owner signin ini tidak memverifikasi akun ke backend.</p>
        ) : null}
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
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
