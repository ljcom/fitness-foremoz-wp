import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { requireField, setSession } from '../lib.js';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function submit(e) {
    e.preventDefault();
    try {
      const fullName = requireField(form.fullName, 'full name');
      const email = requireField(form.email, 'email');
      requireField(form.password, 'password');

      setSession({
        isAuthenticated: true,
        isOnboarded: false,
        role: 'admin',
        user: { fullName, email },
        tenant: null,
        branch: null
      });

      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthLayout
      title="Create admin account"
      subtitle="Setup tenant workspace and branch operations."
      alternateHref="/signin"
      alternateText="Already have account? Sign in"
    >
      <form className="card form" onSubmit={submit}>
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
        <button className="btn" type="submit">
          Continue to onboarding
        </button>
      </form>
    </AuthLayout>
  );
}
