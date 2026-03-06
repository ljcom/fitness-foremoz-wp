import { Link } from 'react-router-dom';

const features = [
  'Registrasi cepat dengan email aktif.',
  'Persiapan akun untuk multi-coach subscription.',
  'Mulai dengan default privacy aman untuk member.'
];

export default function SignUpPage() {
  return (
    <main className="page auth-shell">
      <section className="card auth-card">
        <p className="eyebrow">Signup</p>
        <h1>Create Your Passport Account</h1>
        <p className="sub">Daftar untuk mulai kelola identitas fitness kamu di satu akun.</p>

        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <label>
            Full Name
            <input type="text" placeholder="Samuel Surya" />
          </label>
          <label>
            Email
            <input type="email" placeholder="name@mail.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>
          <button className="btn primary" type="submit">Create Passport</button>
        </form>

        <article className="hint">
          <p className="eyebrow">Informasi</p>
          <p>
            Setelah signup, kamu bisa langsung lanjut onboarding untuk set tujuan fitness awal
            dan preferensi data sharing.
          </p>
        </article>

        <article className="card soft-card">
          <p className="eyebrow">Fitur</p>
          <ul className="feature-list compact">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </article>

        <article className="card cta-banner">
          <div>
            <p className="eyebrow">CTA</p>
            <h2>Sudah Punya Akun?</h2>
            <p className="sub">Masuk untuk lanjut ke dashboard passport kamu.</p>
          </div>
          <div className="hero-actions">
            <Link className="btn ghost" to="/signin">Masuk Sekarang</Link>
            <Link className="btn" to="/">Kembali ke Landing</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
