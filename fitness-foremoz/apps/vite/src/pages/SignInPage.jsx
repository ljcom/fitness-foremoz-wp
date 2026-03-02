import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { getSession, requireField, setSession } from '../lib.js';

export default function SignInPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
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
      const user = current?.user || { fullName: 'Operator', email };

      setSession({
        ...(current || {}),
        isAuthenticated: true,
        isOnboarded: Boolean(current?.isOnboarded),
        user
      });

      navigate(current?.isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your tenant namespace and branch operations."
      alternateHref="/signup"
      alternateText="Need account? Create one"
    >
      <form className="card form" onSubmit={submit}>
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
