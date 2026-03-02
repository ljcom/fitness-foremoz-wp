import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { getSession, requireField, setSession } from '../lib.js';

function roleHome(role, onboarded) {
  if (role === 'sales') return '/sales';
  if (role === 'pt') return '/pt';
  if (role === 'member') return '/member/portal';
  return onboarded ? '/dashboard' : '/onboarding';
}

export default function SignInPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'admin' });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function submit(e) {
    e.preventDefault();
    try {
      const email = requireField(form.email, 'email');
      requireField(form.password, 'password');

      const current = getSession();
      const role = form.role;
      const user = { ...(current?.user || {}), fullName: current?.user?.fullName || 'Operator', email };
      const isOnboarded = role === 'admin' ? Boolean(current?.isOnboarded) : true;

      setSession({
        ...(current || {}),
        isAuthenticated: true,
        isOnboarded,
        role,
        user,
        tenant: current?.tenant || { id: 'tn_001', namespace: 'foremoz:fitness:tn_001', gym_name: 'Foremoz Demo Gym' },
        branch: current?.branch || { id: 'br_jkt_01', chain: 'branch:br_jkt_01' }
      });

      navigate(roleHome(role, isOnboarded), { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Login as admin, sales, PT, or member."
      alternateHref="/signup"
      alternateText="Need admin account? Create one"
    >
      <form className="card form" onSubmit={submit}>
        <label>
          Role
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="admin">admin</option>
            <option value="sales">sales</option>
            <option value="pt">pt</option>
            <option value="member">member</option>
          </select>
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
        <button className="btn" type="submit">
          Sign in
        </button>
      </form>
    </AuthLayout>
  );
}
