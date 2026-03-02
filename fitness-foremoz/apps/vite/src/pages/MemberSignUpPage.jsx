import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { requireField, setSession } from '../lib.js';

export default function MemberSignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    try {
      const fullName = requireField(form.fullName, 'full name');
      const email = requireField(form.email, 'email');
      const phone = requireField(form.phone, 'phone');
      requireField(form.password, 'password');

      setSession({
        isAuthenticated: true,
        isOnboarded: true,
        role: 'member',
        user: { fullName, email, phone },
        tenant: { id: 'tn_001', namespace: 'foremoz:fitness:tn_001', gym_name: 'Foremoz Demo Gym' },
        branch: { id: 'br_jkt_01', chain: 'branch:br_jkt_01' }
      });

      navigate('/member/portal', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthLayout
      title="Member signup"
      subtitle="Join as member and access membership purchase + self booking PT."
      alternateHref="/signin"
      alternateText="Already member? Sign in"
    >
      <form className="card form" onSubmit={submit}>
        <label>
          Full name
          <input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit">Create member account</button>
      </form>
    </AuthLayout>
  );
}
